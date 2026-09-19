#!/usr/bin/env python3
import os
import secrets
from pathlib import Path

path = Path(__file__).resolve().parent / '.env'
if not path.exists():
    fd = os.open(str(path), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as stream:
        stream.write('POSTGRES_PASSWORD=' + secrets.token_hex(32) + '\n')
        stream.write('REDIS_PASSWORD=' + secrets.token_hex(32) + '\n')
    print('Created private database and Redis credentials.')
else:
    print('Existing credentials preserved.')
