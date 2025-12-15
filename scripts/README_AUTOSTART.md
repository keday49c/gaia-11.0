**Gaia autostart and data persistence**

- **What this does:**
  - Adds `scripts/start-gaia.ps1` — starts Docker (if possible) and runs `docker-compose up -d --build` to start Gaia services.
  - Adds `scripts/register-startup-task.ps1` — registers a Windows Scheduled Task (`GaiaAutoStart`) to run the start script at user logon.
  - Adds `docker-compose.override.yml` — bind-mounts Postgres data to `./data/postgres` (host folder) so database files are stored on your filesystem for easier backups.

- **How to enable autostart (one-time):**
  1. Open PowerShell as the user that should start Gaia at login.
  2. Run (from repository root):

```powershell
Set-Location 'C:\Users\user\Documents\gaia30\gaia-11.0\scripts'
.\register-startup-task.ps1
```

  This registers a Scheduled Task that runs at logon. You can confirm in Task Scheduler (look for `GaiaAutoStart`).

- **Manual start (if you don't want autostart):**
  - From repository root run:

```powershell
Set-Location 'C:\Users\user\Documents\gaia30\gaia-11.0\scripts'
.\start-gaia.ps1
```

- **Backups & persistence:**
  - The override binds Postgres data to `./data/postgres`. That folder now contains the database cluster files.
  - To be safe, periodically dump the database using `pg_dump` or run `docker exec gaia-postgres pg_dumpall -U gaia_user > backup.sql`.
  - To migrate existing data from the named volume used previously, use `docker run --rm -v gaia-11.0_postgres_data:/from -v "$PWD/data/postgres":/to alpine ash -c "cd /from && cp -a . /to"` (test and adapt; make backups first).

- **To stop autostart / remove scheduled task:**
  - Run in PowerShell:

```powershell
Unregister-ScheduledTask -TaskName 'GaiaAutoStart' -Confirm:$false
```

- **Notes & limitations:**
  - Docker Desktop must be installed. The scripts attempt to start the Docker service or the Docker Desktop executable but may not succeed if the system locks startup programs or Docker requires user interaction.
  - The scheduled task registers for the current user. If you need system-wide startup (before login), a different approach with a Windows service is required.
  - Storing database files on host (`./data/postgres`) is convenient for backups but keep secure permissions.
