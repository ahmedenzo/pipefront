pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the repository
                git url: 'https://github.com/ahmedenzo/pipefront.git', branch: 'master'
            }
        }

        stage('Build Docker Image') {
            steps {
                // Build the Docker image
                sh 'docker build -t pipefront-angular-nginx -f frontend/Dockerfile .'
            }
        }

        stage('Save Docker Image Locally') {
            steps {
                // Save the image to a tar file (for transfer)
                sh 'docker save -o pipefront-angular-nginx.tar pipefront-angular-nginx:latest'
                
                // Archive the image as an artifact in Jenkins (optional, for keeping within Jenkins)
                archiveArtifacts artifacts: 'pipefront-angular-nginx.tar', allowEmptyArchive: false
            }
        }

        stage('Push Docker Image to Local Registry') {
            steps {
                script {
                    // Push the Docker image to a local registry if needed (optional, use if registry required)
                    docker.withRegistry('http://localhost:5000', 'local-registry-credentials') {
                        sh 'docker push localhost:5000/pipefront-angular-nginx:latest'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Docker image built, saved, and pushed successfully!'
        }
        failure {
            echo 'Failed to build, save, or push Docker image.'
        }
    }
}
