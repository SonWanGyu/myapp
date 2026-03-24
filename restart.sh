#!/bin/bash
echo "========================================="
echo "  🚀 서버 전체 복구 스크립트 시작!"
echo "========================================="

# STEP 1: 미니큐브 먼저 깨우기
echo ""
echo "[1/3] 미니큐브(쿠버네티스) 깨우는 중..."
sudo docker stop $(sudo docker ps -q) 2>/dev/null
minikube start --insecure-registry="host.minikube.internal:5000"

# STEP 2: 인프라 서버 올리기
echo ""
echo "[2/3] Jenkins, Oracle, Registry 올리는 중..."
sudo docker rm -f jenkins-server oracle-db local-registry 2>/dev/null
cd ~/myapp
sudo docker-compose -f docker-compose.ci.yml up -d

# STEP 3: 젠킨스 ↔ 쿠버네티스 연결
echo ""
echo "[3/3] Jenkins에 쿠버네티스 인증서 연결 중..."
sleep 5
sudo docker network connect minikube jenkins-server 2>/dev/null
sudo docker cp ~/.kube jenkins-server:/root/
sudo docker cp ~/.minikube jenkins-server:/root/
sudo docker exec -u root jenkins-server chown -R root:root /root/.kube /root/.minikube
sudo docker exec -u root jenkins-server sed -i 's|127.0.0.1:[0-9]*|minikube:8443|g' /root/.kube/config
sudo docker exec -u root jenkins-server sed -i 's|/home/[^/]*|/root|g' /root/.kube/config

echo ""
echo "========================================="
echo "  ✅ 인프라 복구 완료!"
echo "  👉 Jenkins(http://리눅스IP:8090)에서 [지금 빌드] 클릭"
echo "  👉 빌드 성공(SUCCESS) 후 이 터미널에서 아래 명령어 실행:"
echo ""
echo "     bash ~/myapp/portforward.sh"
echo ""
echo "========================================="
