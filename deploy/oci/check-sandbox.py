import json
import time
import uuid
from pathlib import Path

job = str(uuid.uuid4())
code = '''import os, socket
print("calculation=", sum(range(11)))
print("uid=", os.getuid())
with open('/proc/self/status') as f:
    print(next(line.strip() for line in f if line.startswith('NoNewPrivs:')))
try:
    os.listdir('/spool')
    print('SPOOL_EXPOSED')
except PermissionError:
    print('spool=isolated')
try:
    socket.create_connection(('1.1.1.1', 443), timeout=2)
    print('NETWORK_EXPOSED')
except OSError:
    print('network=isolated')
'''
request = Path('/spool/requests') / (job + '.json')
result = Path('/spool/results') / (job + '.json')
request.write_text(json.dumps({'id': job, 'code': code}))
for _ in range(150):
    if result.exists():
        data = json.loads(result.read_text())
        print(json.dumps(data))
        result.unlink()
        assert data['exitCode'] == 0, data
        assert 'SPOOL_EXPOSED' not in data['stdout']
        assert 'NETWORK_EXPOSED' not in data['stdout']
        assert 'NoNewPrivs:\t1' in data['stdout']
        break
    time.sleep(0.2)
else:
    raise RuntimeError('Sandbox did not return a result')
