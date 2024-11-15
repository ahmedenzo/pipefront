pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                // Replace with your repository details
                git url: 'https://github.com/ahmedenzo/pipefront.git', branch: 'master'
            }
        }

        stage('Build Docker Images') {
            steps {
                // Build the Docker images
                sh 'docker-compose build'
            }
        }

        stage('Save Docker Images Locally') {
            steps {
                // Save the Angular image
                sh 'docker save -o angular-app.tar pipefront_angular-app:latest'
                // Save the Nginx image
                sh 'docker save -o nginx.tar pipefront_nginx:latest'
                // Archive the images
                archiveArtifacts artifacts: '*.tar', allowEmptyArchive: false
            }
        }
    }

    post {
        success {
            echo 'Docker images built and saved successfully!'
        }
        failure {
            echo 'Failed to build or save Docker images.'
        }
    }
}
