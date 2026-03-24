pipeline {
    agent any

    environment {
        // 로컬 Registry 주소 (호스트 기준)
        REGISTRY = "localhost:5000"
        SPRING_IMG = "myapp-spring-boot"
        NODE_IMG = "myapp-node-app"
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
                    // 호스트의 Docker 데몬을 통해 이미지 빌드 (DooD)
                    sh 'docker build -t ${REGISTRY}/${SPRING_IMG}:latest .'
                }
            }
        }

        // 3. Node.js (Next.js) 컨테이너 이미지 빌드
        stage('Build Node.js Image') {
            steps {
                dir('node-app') {
                    sh 'docker build -t ${REGISTRY}/${NODE_IMG}:latest .'
                }
            }
        }

        // 4. 로컬 Registry(내장 저장소)에 이미지 푸시
        stage('Push Images to Local Registry') {
            steps {
                sh 'docker push ${REGISTRY}/${SPRING_IMG}:latest'
                sh 'docker push ${REGISTRY}/${NODE_IMG}:latest'
            }
        }

        // 5. 배포 명세서를 쿠버네티스 클러스터에 배포 (완벽한 CD 자동화)
        stage('Deploy to Kubernetes') {
            steps {
                // k8s/ 내부의 배포 명세서(YAML)를 쿠버네티스에 적용시킵니다.
                sh 'kubectl apply -f k8s/'
                
                // 새로운 버전의 애플리케이션 파드가 완벽하게 뜰 때까지 기다립니다.
                sh 'kubectl rollout status deployment/spring-boot-app'
                sh 'kubectl rollout status deployment/node-app'
            }
        }
    }
}
