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
                configFileProvider([configFile(fileId: 'cert', targetLocation: 'cert.crt')]) {
                    sh 'ls -la && cat cert.crt' 
                }
            }
        }
        stage('Pre-build Cleanup') {
            steps {
                script {
                    sh '''
                    DANGLING_COUNT=$(docker images -f "dangling=true" -q | wc -l)
                    echo "Found $DANGLING_COUNT dangling images (<none>)"
                    if [ "$DANGLING_COUNT" -gt 0 ]; then
                        echo "Dangling images details:"
                        docker images -f "dangling=true"
                        echo "Removing dangling images..."
                        docker images -f "dangling=true" -q | xargs -r docker rmi -f || true
                        echo "Dangling images removed successfully"
                    else
                        echo "No dangling images found"
                    '''
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
