// Jenkins pipeline for Cafeteria Seat Reservation
// Uses Docker agent (node:18) so Node/npm are always available. Requires Docker and "Docker Pipeline" plugin.

pipeline {
  agent {
    docker {
      image 'node:18'
      reuseNode true
    }
  }

  options {
    timeout(time: 15, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    NODE_ENV = 'test'
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
