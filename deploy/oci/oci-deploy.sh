#!/usr/bin/env bash
# Invoked by the GitHub Actions release job on the existing Oracle VM.
set -Eeuo pipefail
umask 077

sha=${1:-}
[[ $sha =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid commit SHA' >&2; exit 2; }

root=/home/ubuntu/openagent-deploy
stage="$root/incoming/$sha"
live=/home/ubuntu/open-agent/deploy/oci
docker=/snap/bin/docker

exec 9>"$root/deploy.lock"
flock -n 9 || { echo 'Another OpenAgent deployment is running' >&2; exit 1; }
for path in "$stage/images.tar.gz" "$stage/compose.yml" "$stage/compose.autodeploy.yml" "$stage/openagent.service" "$live/.env" "$live/config.json" "$live/backup.sh"; do
  test -s "$path" || { echo "Required deployment file missing: $path" >&2; exit 1; }
done
test -x "$docker" || { echo 'Snap Docker is unavailable' >&2; exit 1; }
free_kb=$(df -Pk "$root" | awk 'NR == 2 {print $4}')
(( free_kb >= 3 * 1024 * 1024 )) || { echo 'Less than 3 GiB free; deployment stopped to protect data' >&2; exit 1; }

# Loading images and taking a consistent backup happen before any service
# definition changes. Database and file volumes are never recreated.
gzip -dc "$stage/images.tar.gz" | "$docker" load >/dev/null
"$docker" image inspect "openagent:$sha" "openagent-sandbox:$sha" >/dev/null
cd "$live"
"$docker" compose -f compose.yml config --quiet
/bin/bash "$live/backup.sh"

rollback_dir=$(mktemp -d "$root/rollback-$sha-XXXXXX")
cp -p compose.yml "$rollback_dir/compose.yml"
if test -f compose.autodeploy.yml; then cp -p compose.autodeploy.yml "$rollback_dir/compose.autodeploy.yml"; fi
if test -f .release.env; then cp -p .release.env "$rollback_dir/release.env"; fi
if test -f /etc/systemd/system/openagent.service; then cp -p /etc/systemd/system/openagent.service "$rollback_dir/openagent.service"; fi
armed=1
rollback() {
  result=$?
  trap - ERR
  if (( armed )); then
    echo 'Deployment failed; restoring prior service definitions' >&2
    cp -p "$rollback_dir/compose.yml" "$live/compose.yml"
    if test -f "$rollback_dir/compose.autodeploy.yml"; then
      cp -p "$rollback_dir/compose.autodeploy.yml" "$live/compose.autodeploy.yml"
    else
      rm -f "$live/compose.autodeploy.yml"
    fi
    if test -f "$rollback_dir/release.env"; then
      cp -p "$rollback_dir/release.env" "$live/.release.env"
      set -a; . "$live/.release.env"; set +a
      "$docker" compose -f compose.yml -f compose.autodeploy.yml up -d --no-build || true
    else
      rm -f "$live/.release.env"
      "$docker" compose -f compose.yml up -d --no-build || true
    fi
    if test -f "$rollback_dir/openagent.service"; then
      cp -p "$rollback_dir/openagent.service" /etc/systemd/system/openagent.service
      systemctl daemon-reload || true
    fi
  fi
  exit "$result"
}
trap rollback ERR

install -m 0644 "$stage/compose.yml" "$live/compose.yml"
install -m 0644 "$stage/compose.autodeploy.yml" "$live/compose.autodeploy.yml"
printf 'OPENAGENT_APP_IMAGE=openagent:%s\nOPENAGENT_SANDBOX_IMAGE=openagent-sandbox:%s\n' "$sha" "$sha" > "$live/.release.env"
chmod 0600 "$live/.release.env"
set -a; . "$live/.release.env"; set +a
"$docker" compose -f compose.yml -f compose.autodeploy.yml config --quiet
"$docker" compose -f compose.yml -f compose.autodeploy.yml up -d --no-build --wait
healthy=0
for attempt in $(seq 1 20); do
  if curl --fail --silent --max-time 5 http://127.0.0.1:3010/api/auth/session >/dev/null; then healthy=1; break; fi
  sleep 3
done
(( healthy == 1 )) || { echo 'Application did not pass its local HTTP health check' >&2; false; }

# Only update boot recovery after the new release has passed health checks.
install -m 0644 "$stage/openagent.service" /etc/systemd/system/openagent.service
systemctl daemon-reload
systemctl enable openagent.service >/dev/null
printf '%s\n' "$sha" > "$root/last-successful-commit"
armed=0
trap - ERR

# Keep the current and immediately preceding release for fast rollback.
history="$root/deployed-shas"
{ printf '%s\n' "$sha"; if test -f "$history"; then cat "$history"; fi; } | awk '!seen[$0]++' > "$root/deployed-shas.next"
sed -n '3,$p' "$root/deployed-shas.next" | while IFS= read -r old_sha; do
  if [[ $old_sha =~ ^[0-9a-f]{40}$ ]]; then
    "$docker" image rm "openagent:$old_sha" "openagent-sandbox:$old_sha" >/dev/null 2>&1 || true
  fi
done
sed -n '1,2p' "$root/deployed-shas.next" > "$history"
rm -f "$root/deployed-shas.next" "$stage/images.tar.gz"
echo "OpenAgent release $sha is healthy on Oracle"
