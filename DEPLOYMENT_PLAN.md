# OpenAgent deployment plan for Oracle Cloud Always Free

## Discovered architecture

OpenAgent is a Node.js 22/NestJS backend serving the compiled React client on port 3010. It stores relational and vector data in PostgreSQL with pgvector, queues and cache data in Redis, and stores Copilot files through a configurable filesystem provider. Its existing Compose file runs PostgreSQL, Redis, a one-shot migration service, and the application. Authentication already provides Argon2 password hashing, HttpOnly session cookies, logout, protected guards, and throttling. The public signup path depended on SMTP magic links, so this deployment adds a direct email-and-password registration endpoint and UI.

The upstream Python tool uses the external E2B service. This deployment selects a local spool worker when no E2B key is configured. The worker runs inside a dedicated no-network container with a read-only root filesystem, dropped capabilities, no-new-privileges, resource limits, a bounded temporary filesystem, execution timeouts, and no Docker socket or host filesystem mounts.

## OCI topology

- Existing Always Free instance renamed from `buildx` to `openagent`.
- Region `me-riyadh-1`, AD-1, shape `VM.Standard.A1.Flex`, 1 OCPU and 6 GB RAM.
- Existing public subnet and Internet Gateway remain in use.
- OCI ingress will expose TCP 80 and 443. SSH stays available only for administration and will be narrowed when the current management source address is known.
- Nginx on the VM is the only public application entry point. The application binds to `127.0.0.1:3010`; PostgreSQL, Redis, Ollama, and the sandbox publish no host ports.

## Deployment steps

1. Restore SSH access using OCI Run Command and a dedicated project public key.
2. Install updates, Docker Engine/Compose, Nginx, Git, UFW, and basic diagnostics.
3. Create `/opt/open-agent`, upload this validated working copy, and generate a mode-0600 `.env` with independent database and Redis passwords.
4. Build the customized ARM64 application image and isolated sandbox image.
5. Start PostgreSQL, Redis, the migration job, OpenAgent, Ollama, and the sandbox through Compose.
6. Pull `qwen2.5:1.5b` and `nomic-embed-text` into the persistent Ollama volume. This keeps the default AI path on the OCI VM and avoids paid AI services.
7. Install the Nginx site and the `openagent.service` systemd unit; configure UFW consistently with OCI ingress.
8. Validate registration, password login, session persistence, protected access, logout, sandbox execution, AI chat, service health, restart recovery, persistence, and public port exposure.
9. Record actual results, maintenance commands, backup/restore instructions, and any measured limitation in `DEPLOYMENT_REPORT.md`.

## Capacity controls

The 6 GB VM uses explicit container memory limits: PostgreSQL 768 MB, Redis 256 MB, app 1.75 GB, Ollama 2.25 GB, and sandbox 512 MB. A small swap file can protect the build, but runtime should normally remain within physical memory. The deployment will not add billable OCI services or storage.
