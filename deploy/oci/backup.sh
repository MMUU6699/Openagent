#!/bin/bash
set -euo pipefail
umask 077
cd /home/ubuntu/open-agent/deploy/oci
backup_root=/home/ubuntu/openagent-backups
mkdir -p "$backup_root"
chmod 700 "$backup_root"
backup_dir=$(mktemp -d "$backup_root/backup-$(date -u +%Y%m%dT%H%M%SZ)-XXXX")
trap '/snap/bin/docker compose start app >/dev/null' EXIT
/snap/bin/docker compose stop app >/dev/null
/snap/bin/docker compose exec -T postgres pg_dump -U openagent -d open_agent -Fc > "$backup_dir/database.dump"
/snap/bin/docker run --rm --network none -v openagent_app_data:/data:ro alpine:3.22 tar czf - -C /data . > "$backup_dir/files.tar.gz"
cp config.json .env compose.yml "$backup_dir/"
test -s "$backup_dir/database.dump"
tar tzf "$backup_dir/files.tar.gz" >/dev/null
date -u > "$backup_dir/COMPLETE"
echo "Backup completed: $backup_dir"
# Retain seven completed backups, only inside this dedicated directory.
python3 - "$backup_root" <<'PY'
import pathlib, shutil, sys
root = pathlib.Path(sys.argv[1]).resolve()
items = sorted(p for p in root.glob('backup-*') if p.is_dir() and not p.is_symlink() and (p/'COMPLETE').is_file())
for item in items[:-7]:
    assert item.resolve().parent == root
    shutil.rmtree(item)
PY
