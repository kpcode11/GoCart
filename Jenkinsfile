pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'gocart:latest'
    }

    tools {
        nodejs 'node20' // Ensure NodeJS plugin is installed and a tool named 'node20' is configured
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Running npm ci..."
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo "Running linter..."
                sh 'npm run lint'
            }
        }

        stage('Tests') {
            steps {
                echo "No tests configured in package.json. Skipping test execution."
                // sh 'npm test'
            }
        }

        stage('Prisma Generate') {
            steps {
                echo "Generating Prisma Client..."
                sh 'npx prisma generate'
            }
        }

        stage('Next.js Production Build') {
            steps {
                echo "Building Next.js for production..."
                // Safely inject .env file during build using Credentials Binding plugin
                withCredentials([file(credentialsId: 'gocart-env', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env'
                    sh 'npm run build'
                }
            }
        }

        // stage('Docker Image Build') {
        //     steps {
        //         echo "Building Docker Image..."
        //         sh "docker build -t ${DOCKER_IMAGE} ."
        //     }
        // }
    }

    post {
        always {
            echo "Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo "Pipeline executed successfully!"
        }
        failure {
            echo "Pipeline failed. Please check the logs."
        }
    }
}
