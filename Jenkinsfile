pipeline {
    agent any

    stages {
        stage('Cloner le dépôt') {
            steps {
                git 'https://github.com/ahmedenzo/pipefront.git'  // Remplacez par l'URL de votre dépôt Git
            }
        }

        stage('Construire les images Docker') {
            steps {
                sh 'docker-compose build'  // Construit les images sans lancer les conteneurs
            }
        }

        stage('Sauvegarder les images en local') {
            steps {
                sh 'docker save -o angular-app.tar angular-app:latest'  // Sauvegarde de l'image Angular
                sh 'docker save -o nginx.tar nginx:latest'              // Sauvegarde de l'image Nginx
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
