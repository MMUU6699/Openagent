#!/usr/bin/env python3
import json
import ctypes
import os
import resource
import signal
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

SPOOL = Path(os.environ.get("SANDBOX_SPOOL", "/spool"))
REQUESTS = SPOOL / "requests"
RESULTS = SPOOL / "results"
MAX_OUTPUT = 1024 * 1024


def limits():
    # Apply to the executor after Python starts: snap Docker's AppArmor
    # transition rejects no-new-privileges at container entry on this host.
    if ctypes.CDLL(None, use_errno=True).prctl(38, 1, 0, 0, 0) != 0:
        raise OSError(ctypes.get_errno(), 'Cannot set no_new_privs')
    os.setgroups([])
    os.setgid(10001)
    os.setuid(10001)
    resource.setrlimit(resource.RLIMIT_CPU, (20, 20))
    resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024,) * 2)
    resource.setrlimit(resource.RLIMIT_FSIZE, (16 * 1024 * 1024,) * 2)
    resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))
    resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))


def process(request_path: Path):
    workdir = Path(tempfile.mkdtemp(prefix="openagent-", dir="/tmp"))
    os.chown(workdir, 10001, 10001)
    try:
        request = json.loads(request_path.read_text(encoding="utf-8"))
        result = {"stdout": "", "stderr": "", "exitCode": None, "timedOut": False}
        try:
            # File-backed output avoids unbounded capture_output allocations.
            stdout_path = workdir / "stdout.log"
            stderr_path = workdir / "stderr.log"
            with stdout_path.open('wb') as stdout_file, stderr_path.open('wb') as stderr_file:
              child = subprocess.Popen(
                ["python3", "-I", "-"],
                stdin=subprocess.PIPE,
                text=True,
                cwd=workdir,
                stdout=stdout_file,
                stderr=stderr_file,
                preexec_fn=limits,
                start_new_session=True,
                env={"PATH": "/usr/local/bin:/usr/bin:/bin", "HOME": str(workdir)},
              )
              try:
                child.communicate(request['code'], timeout=25)
              except subprocess.TimeoutExpired:
                result['timedOut'] = True
              finally:
                try:
                  os.killpg(child.pid, signal.SIGKILL)
                except ProcessLookupError:
                  pass
                child.wait()
            with stdout_path.open('rb') as output:
                result['stdout'] = output.read(MAX_OUTPUT).decode('utf-8', errors='replace')
            with stderr_path.open('rb') as output:
                result['stderr'] = output.read(MAX_OUTPUT).decode('utf-8', errors='replace')
            result['exitCode'] = child.returncode
        except Exception as exc:
            result['stderr'] = str(exc)

        target = RESULTS / f"{request['id']}.json"
        pending = target.with_suffix(".tmp")
        pending.write_text(json.dumps(result), encoding="utf-8")
        pending.replace(target)
    except Exception as exc:
        fallback = RESULTS / f"{request_path.stem}.json"
        fallback.write_text(
            json.dumps({"stdout": "", "stderr": str(exc), "exitCode": 1, "timedOut": False}),
            encoding="utf-8",
        )
    finally:
        request_path.unlink(missing_ok=True)
        shutil.rmtree(workdir, ignore_errors=True)


REQUESTS.mkdir(parents=True, exist_ok=True)
RESULTS.mkdir(parents=True, exist_ok=True)
while True:
    for request_path in sorted(REQUESTS.glob("*.json")):
        process(request_path)
    time.sleep(0.2)
