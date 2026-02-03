// Jenkins pipeline for Cafeteria Seat Reservation
// Requires Node.js 18+ and npm on the agent (see docs/JENKINS.md for making Node available on Mac).

pipeline {
  agent any

  options {
    timeout(time: 15, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    NODE_ENV = 'test'
    PATH = "/Users/sushil/.nvm/versions/node/v24.13.0/bin:${env.PATH}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        dir('server') {
          sh 'npm ci'
        }
        dir('client') {
          sh 'npm ci'
        }
      }
    }

    stage('Build') {
      steps {
        dir('server') {
          sh 'npm run build'
        }
        dir('client') {
          sh 'npm run build'
        }
      }
    }

    stage('Test') {
      steps {
        dir('server') {
          sh 'npm run test'
        }
      }
      post {
        always {
          publishHTML(target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            reportDir: 'server/coverage/lcov-report',
            reportFiles: 'index.html',
            reportName: 'Server Coverage Report'
          ])
        }
      }
    }
  }

  post {
    always {
      cleanWs(deleteDirs: true, patterns: [[pattern: '.test-mongo-uri', type: 'INCLUDE']])
    }
    failure {
      echo 'Pipeline failed. Check logs above.'
    }
    success {
      echo 'Pipeline completed successfully.'
    }
  }
}
