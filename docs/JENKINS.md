# Jenkins Setup

This project includes a **Jenkinsfile** for CI: install dependencies, build server and client, and run server tests. Tests use an in-memory MongoDB (no external DB required on the agent).

## Prerequisites

- **Docker** on the Jenkins agent (recommended): the pipeline runs inside a `node:18` container, so Node/npm are always available.
- **Plugins:** "Docker Pipeline" (Pipeline: Docker) so Jenkins can run `agent { docker { ... } }`.
- No MongoDB needed for tests (Jest uses `mongodb-memory-server`).

If you cannot use Docker, see [No Docker](#no-docker) below.

## Creating the Jenkins job

1. In Jenkins: **New Item** → enter a name (e.g. `cafeteria-seat-reservation`) → **Pipeline** → OK.

2. Under **Pipeline**:
   - **Definition:** *Pipeline script from SCM*
   - **SCM:** Git
   - **Repository URL:** your repo URL (e.g. `https://github.com/your-org/cafe_T1.git` or local path)
   - **Branch:** `*/main` (or your default branch)
   - **Script Path:** `Jenkinsfile`

3. Save. Run **Build Now**.

## What the pipeline does

| Stage      | Action |
|-----------|--------|
| Checkout  | Clone the repository |
| Install   | `npm ci` in `server/` and `client/` |
| Build     | `npm run build` in server and client (TypeScript compile + Vite build) |
| Test      | `npm run test` in server (Jest with coverage) |

After a successful run, the **Server Coverage Report** is published as an HTML report (if the HTML Publisher plugin is installed).

## No Docker

If Docker is not available, run the pipeline on a bare agent that has Node 18+ and npm in `PATH`:

1. In **Jenkinsfile**, replace the `agent` block with:
   ```groovy
   agent any
   ```
2. On the Jenkins agent (e.g. your Mac), ensure Node/npm are on the **PATH for the user that runs Jenkins**. If you use nvm or Homebrew, Jenkins may not load your shell profile—either install Node globally (e.g. `/usr/local`) or in the Jenkins job add an "Execute shell" build step that runs `source ~/.nvm/nvm.sh` (or similar) before the pipeline runs, or set **PATH** in the job's environment.

## Troubleshooting

- **"npm: command not found"**  
  The pipeline uses a Docker agent (`node:18`) by default—install Docker and the "Docker Pipeline" plugin. Or switch to `agent any` and ensure Node 18+ and npm are in PATH for the user running Jenkins (see [No Docker](#no-docker)).

- **Tests fail with timeout**  
  In-memory MongoDB can be slow on first start; the pipeline timeout is 15 minutes. Increase in the Jenkinsfile if needed.

- **Build fails on Windows agent**  
  The Jenkinsfile uses `sh`; on Windows use a Linux-style agent or wrap commands in `bat` for Windows.
