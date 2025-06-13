pipeline {
  agent any

  environment {
    FRONTEND_DIR = 'frontend'
    NODE_ENV = credentials('PHOTOSHARE_NODE_ENV')
    PORT = credentials('PHOTOSHARE_PORT')
    FRONTEND_URL = credentials('PHOTOSHARE_FRONTEND_URL')
    JWT_SECRET = credentials('PHOTOSHARE_JWT_SECRET')
    JWT_EXPIRES_IN = credentials('PHOTOSHARE_JWT_EXPIRES_IN')
    MONGODB_URI = credentials('PHOTOSHARE_MONGODB_URI')
    MAX_FILE_SIZE = credentials('PHOTOSHARE_MAX_FILE_SIZE')
  }

  tools {
    nodejs 'Node 18' // Make sure Node 18 is configured in Jenkins tools
  }

  stages {
    stage('Install Backend Dependencies') {
      steps {
        bat 'npm ci'
      }
    }

    stage('Install Frontend Dependencies') {
      steps {
        bat 'cd %FRONTEND_DIR% && npm ci --include=dev'
      }
    }

    stage('Build Frontend') {
      steps {
        bat 'cd %FRONTEND_DIR% && npm run build'
      }
    }

    stage('Deploy') {
      steps {
        bat 'npm start'
      }
    }
  }

  post {
    success {
      echo '✅ Deployment successful!'
    }
    failure {
      echo '❌ Deployment failed.'
    }
  }
}
