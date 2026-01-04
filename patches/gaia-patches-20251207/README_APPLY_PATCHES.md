Gaia patches package

Files included:
- docker-compose.yml
- Dockerfile
- client.Dockerfile
- scripts/wait-for-db.sh
- scripts/gaia-stack.service
- .env.example
- apply-patches.sh (helper to copy files into project root)

How to apply (safe, idempotent):
1) Transfer this folder to the Linux host (scp, rsync, etc.).
   Example:
   scp -r gaia-patches-20251207 user@host:/tmp/

2) On the host, inspect files and set PROJECT_ROOT.
   Example assume project root will be `/opt/gaia-11.0`.

3) Run the helper script (as root):
   sudo /tmp/gaia-patches-20251207/apply-patches.sh /opt/gaia-11.0

4) Edit systemd unit and replace placeholder path.
   sudo sed -i 's|/path/to/gaia-11.0|/opt/gaia-11.0|g' /etc/systemd/system/gaia-stack.service

5) Reload systemd and enable start on boot:
   sudo systemctl daemon-reload
   sudo systemctl enable --now gaia-stack.service

6) Build the stack and bring it up:
   cd /opt/gaia-11.0
   docker compose build --pull
   docker compose up -d --remove-orphans

7) Validate following README instructions or run the validation commands provided in the audit report.

Notes and cautions:
- This script does NOT modify or remove any Docker volumes.
- Confirm `.env` strategy before copying secrets; fill `.env.example` into `.env` with secure values.
- The systemd unit must be updated with the correct WorkingDirectory and ExecStart paths before enabling.
