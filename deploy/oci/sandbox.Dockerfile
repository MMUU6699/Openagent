FROM python:3.12-slim
RUN useradd --system --uid 10001 --create-home sandbox
COPY sandbox-worker.py /usr/local/bin/sandbox-worker.py
RUN chmod 0555 /usr/local/bin/sandbox-worker.py
ENTRYPOINT ["python3", "/usr/local/bin/sandbox-worker.py"]
