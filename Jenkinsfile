pipeline {
    agent any
    triggers {
        githubPush()
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/hoangdinh2411/coupons-api.git'
            }
        }
        stage('Copy .env file') {
            steps {
                configFileProvider([configFile(fileId: 'coupons-api-env', targetLocation: '.env')]) {
                    sh 'ls -la && cat .env' 
                }
            }
        }
        stage('Saving certificate database') {
            steps {
                configFileProvider([configFile(fileId: 'dbtrustcoupon-ca-certificate.crt', targetLocation: 'dbtrustcoupon-ca-certificate.crt')]) {
                    sh 'ls -la && cat dbtrustcoupon-ca-certificate.crt' 
                }
            }
        }
        stage('Build and Restart Docker Containers') {
            steps {
                script {
                    sh '''
                    docker-compose down
                    docker-compose up --build -d
                    '''
                }
            }
        }
    }
}
