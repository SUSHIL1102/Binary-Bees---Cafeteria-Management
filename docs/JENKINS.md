# Jenkins Setup

This project includes a **Jenkinsfile** for CI: install dependencies, build server and client, and run server tests. Tests use an in-memory MongoDB (no external DB required on the agent).

## Prerequisites

- **Node.js 18+** and **npm** must be available to Jenkins (see [Making Node available on Mac](#making-node-available-on-mac) below).
- No MongoDB needed for tests (Jest uses `mongodb-memory-server`).

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

## Making Node available on Mac

Jenkins often runs without your shell profile, so `node` and `npm` may not be in PATH. Use one of these:

### Option A: Set PATH in the Jenkins job (quick)

1. In Terminal, run: `which node` and `which npm`. You’ll get something like `/Users/sushil/.nvm/versions/node/v18.x.x/bin/node`.
2. In Jenkins: open your **Pipeline job** → **Configure**.
3. Under **Pipeline**, in **Pipeline script from SCM**, you can’t set env there. So use **Build Environment** (if available) to add **PATH** = `$HOME/.nvm/versions/node/v18.19.0/bin:/usr/bin:/bin` (use the directory from step 1).
4. Or add a first stage in the Jenkinsfile that sets PATH (see Option C).

### Option B: Install Node so Jenkins can see it (recommended)

Install Node in a place that’s on the default PATH for the user that runs Jenkins:

- **From nodejs.org:** download the macOS installer and install. Node goes to `/usr/local/bin`, which is usually in PATH.
- **Homebrew:** run `brew install node`. Then ensure Jenkins is started from a shell that has `/opt/homebrew/bin` (or `/usr/local/bin`) in PATH.

Restart Jenkins after installing, then run the pipeline again.

### Option C: Set PATH in the Jenkinsfile

If you use nvm, add this at the top of the pipeline (after `agent any`) so the first stages run with Node in PATH:

```groovy
environment {
  NODE_ENV = 'test'
  // Adjust path to match your nvm node version:
  PATH = "/Users/sushil/.nvm/versions/node/v18.19.0/bin:${env.PATH}"
}
```

Replace the path with the output of `dirname $(which node)` on your Mac.

## Troubleshooting

- **"npm: command not found"**  
  Jenkins doesn’t see Node/npm. Use [Making Node available on Mac](#making-node-available-on-mac) above.

- **Tests fail with timeout**  
  In-memory MongoDB can be slow on first start; the pipeline timeout is 15 minutes. Increase in the Jenkinsfile if needed.

- **Build fails on Windows agent**  
  The Jenkinsfile uses `sh`; on Windows use a Linux-style agent or wrap commands in `bat` for Windows.
