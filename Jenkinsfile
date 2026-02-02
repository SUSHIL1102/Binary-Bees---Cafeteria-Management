// Cafeteria Seat Reservation - Jenkins Pipeline
// Runs backend tests (Jest + in-memory MongoDB) and frontend build.
// Requires: Node.js plugin + "Node 18" (or "Node 20") in Manage Jenkins → Tools → NodeJS.
// Optional: HTML Publisher plugin to add publishHTML for coverage report.

pipeline {
  agent any

  tools {
    nodejs 'Node 18'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
  }

  environment {
    NODE_ENV = 'test'
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend: Install & Test') {
      steps {
        dir('server') {
          sh 'npm ci --no-audit --no-fund'
          sh 'npx prisma generate'
          sh 'rm -f .test-mongo-uri'
          echo 'Starting MongoDB + prisma db push in background...'
          sh 'nohup node scripts/preload-mongo.cjs > preload.log 2>&1 & echo $! > preload.pid'
          echo 'Waiting 100s for preload (MongoDB + prisma db push)...'
          sh 'sleep 100'
          sh 'cat preload.log || true'
          sh 'test -f .test-mongo-uri || (echo "Preload did not write .test-mongo-uri (prisma db push may have failed or timed out)" && exit 1)'
          echo 'Running tests...'
          timeout(time: 10, unit: 'MINUTES') {
            sh 'npm test -- --verbose'
          }
          sh 'kill $(cat preload.pid) 2>/dev/null || true'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'server/coverage/junit.xml'
        }
      }
    }

    stage('Backend: Build') {
      steps {
        dir('server') {
          sh 'npm run build'
        }
      }
    }

    stage('Frontend: Install & Build') {
      steps {
        dir('client') {
          sh 'npm ci --no-audit --no-fund'
          sh 'npm run build'
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline succeeded: tests passed, server and client built.'
    }
    failure {
      echo 'Pipeline failed. Check the logs above.'
    }
  }
}
