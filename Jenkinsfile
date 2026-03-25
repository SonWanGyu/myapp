pipeline {
    agent any

    environment {
        // 로컬 Registry 주소 (호스트 기준)
        REGISTRY = "localhost:5000"
        SPRING_IMG = "myapp-spring-boot"
        NODE_IMG = "myapp-node-app"
        BATCH_IMG = "myapp-spring-batch"
    }

    stages {
        // 1. GitHub에서 코드 가져오기
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        // 2. Spring Boot 컨테이너 이미지 빌드
        stage('Build Spring Boot Image') {
            steps {
                dir('spring-boot') {
                    sh 'docker build -t ${REGISTRY}/${SPRING_IMG}:latest .'
                }
            }
        }

        // 3. Spring Batch 컨테이너 이미지 빌드
        stage('Build Spring Batch Image') {
            steps {
                dir('spring-batch-app') {
                    sh 'docker build -t ${REGISTRY}/${BATCH_IMG}:latest .'
                }
            }
        }

        // 4. Node.js (Next.js) 컨테이너 이미지 빌드
        stage('Build Node.js Image') {
            steps {
                dir('node-app') {
                    sh 'docker build -t ${REGISTRY}/${NODE_IMG}:latest .'
                }
            }
        }

        // 5. 로컬 Registry(내장 저장소)에 이미지 푸시
        stage('Push Images to Local Registry') {
            steps {
                sh 'docker push ${REGISTRY}/${SPRING_IMG}:latest'
                sh 'docker push ${REGISTRY}/${BATCH_IMG}:latest'
                sh 'docker push ${REGISTRY}/${NODE_IMG}:latest'
            }
        }

        // 6. 배포 명세서를 쿠버네티스 클러스터에 배포 (완벽한 CD 자동화)
        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/'
                
                sh 'kubectl rollout restart deployment/spring-boot-app'
                sh 'kubectl rollout restart deployment/node-app'
                
                sh 'kubectl rollout status deployment/spring-boot-app'
                sh 'kubectl rollout status deployment/node-app'
            }
        }
    }
}
