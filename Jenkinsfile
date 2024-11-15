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
                sh 'docker build -t pipefront-angular-nginx .'
            }
        }

        stage('Save Docker Image Locally') {
            steps {
                // Save the image locally (optional if you need to keep it on the Jenkins server)
                sh 'docker save -o angular-nginx-app.tar pipefront-angular-nginx:latest'
                
                // Archive the image as an artifact
                archiveArtifacts artifacts: 'angular-nginx-app.tar', allowEmptyArchive: false
            }
        }

        stage('Push Docker Image to Registry') {
            steps {
                script {
                    // Push the Docker image to DockerHub or any other registry
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        sh 'docker push pipefront-angular-nginx:latest'
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
