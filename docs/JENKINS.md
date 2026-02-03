# Jenkins Setup

This project includes a **Jenkinsfile** for CI: install dependencies, build server and client, and run server tests. Tests use an in-memory MongoDB (no external DB required on the agent).

## Prerequisites on the Jenkins agent

- **Node.js 18+** and **npm** (or use a Docker agent with `node:18`)
- No MongoDB needed for tests (Jest uses `mongodb-memory-server`)

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

## Optional: run with Docker agent

If your Jenkins has the Docker Pipeline plugin and you prefer a containerized run:

1. Edit the **Jenkinsfile** and change the first line to use a Docker agent:

   ```groovy
   pipeline {
     agent {
       docker {
         image 'node:18'
         reuseNode true
       }
     }
   ```

2. The rest of the pipeline stays the same; Node 18 and npm are provided by the image.

## Troubleshooting

- **"npm: command not found"**  
  Install Node.js on the agent or use a Docker agent with a Node image.

- **Tests fail with timeout**  
  In-memory MongoDB can be slow on first start; the pipeline timeout is 15 minutes. Increase in the Jenkinsfile if needed.

- **Build fails on Windows agent**  
  The Jenkinsfile uses `sh`; on Windows use a Linux-style agent or wrap commands in `bat` for Windows.
