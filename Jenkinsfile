pipeline {
    agent any

    stages {
        stage('Cloner le dépôt') {
            steps {
                // Clone the repository. Replace with the correct repository URL if necessary.
                git url: 'https://github.com/ahmedenzo/pipefront.git', branch: 'master'
            }
        }

        stage('Construire les images Docker') {
            steps {
                // Build the Docker images using docker-compose (without launching containers)
                sh 'docker-compose build'
            }
        }

        stage('Sauvegarder les images en local') {
            steps {
                // Save the Docker images to tar files
                sh 'docker save -o angular-app.tar pipefront-angular-app:latest'  // Save the Angular image
                sh 'docker save -o nginx.tar nginx:latest'              // Save the Nginx image
                // Archive the tar files as artifacts
                archiveArtifacts artifacts: '*.tar', allowEmptyArchive: false
            }
        }
    }

    post {
        success {
            echo 'Construction et sauvegarde des images réussies !'
        }
        failure {
            echo 'Échec de la construction ou de la sauvegarde des images.'
        }
    }
}
