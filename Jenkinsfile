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
        sh 'npm install'
      }
    }

    stage('Install Frontend Dependencies') {
      steps {
        dir("${FRONTEND_DIR}") {
          sh 'npm install'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir("${FRONTEND_DIR}") {
          sh 'npm run build'
        }
      }
    }

    stage('Copy Frontend Build to Backend (Optional)') {
      steps {
        // If you plan to serve frontend using Express static middleware
        sh 'cp -r frontend/build ./build'
      }
    }

    stage('Run Tests (Optional)') {
      steps {
        sh 'npm test || true' // Optional if you have tests
      }
    }

    stage('Deploy') {
      steps {
        // Replace this with your actual deployment steps
        sh '''
          echo "Deploying application..."
          # Example: scp or rsync files to server
          # scp -r . user@your-server:/path/to/deploy/
        '''
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
