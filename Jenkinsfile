// Cafeteria Seat Reservation - Jenkins Pipeline
// Runs backend tests (Jest + in-memory MongoDB) and frontend build.
// Requires: Node.js 18+ (configure "Node 18" in Jenkins Global Tool Configuration, or use default node on agent)

pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 15, unit: 'MINUTES')
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
          sh 'npm test'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'server/coverage/junit.xml'
          publishHTML(target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            reportDir: 'server/coverage/lcov-report',
            reportFiles: 'index.html',
            reportName: 'Jest Coverage Report'
          ])
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
