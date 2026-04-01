#!/bin/bash
echo "🔌 포트 포워딩 시작..."

# sudo 비밀번호 미리 입력
sudo -v

# 1단계: 기존 kubectl port-forward 프로세스 완전 정리
echo "🧹 기존 포트 포워딩 프로세스 정리 중..."
sudo pkill -9 -f "kubectl port-forward" 2>/dev/null
sleep 1

# 2단계: 80번, 8080번 포트를 점유 중인 프로세스가 있으면 강제 종료
PORT80_PID=$(sudo lsof -ti:80 2>/dev/null)
if [ -n "$PORT80_PID" ]; then
  echo "⚠️  80번 포트 점유 프로세스(PID: $PORT80_PID) 강제 종료..."
  sudo kill -9 $PORT80_PID 2>/dev/null
  sleep 1
fi

PORT8080_PID=$(sudo lsof -ti:8080 2>/dev/null)
if [ -n "$PORT8080_PID" ]; then
  echo "⚠️  8080번 포트 점유 프로세스(PID: $PORT8080_PID) 강제 종료..."
  sudo kill -9 $PORT8080_PID 2>/dev/null
  sleep 1
fi

# 3단계: 파드가 Running 상태인지 확인 후 포워딩
echo "⏳ 파드 상태 확인 중..."
kubectl wait --for=condition=Ready pod -l app=node-app --timeout=60s 2>/dev/null
kubectl wait --for=condition=Ready pod -l app=spring-boot --timeout=60s 2>/dev/null

# 4단계: 백그라운드로 포트 포워딩 실행
sudo kubectl --kubeconfig=$HOME/.kube/config port-forward svc/node-app-service 80:3000 --address 0.0.0.0 &
kubectl port-forward svc/spring-boot-service 8080:8080 --address 0.0.0.0 &

echo ""
echo "✅ 포트 포워딩 완료!"
echo "   - 프론트엔드: http://리눅스IP  (포트 없이 접속!)"
echo "   - 백엔드:     http://리눅스IP:8080"
echo "   - Jenkins:    http://리눅스IP:8090"
echo ""
echo "💡 포트 포워딩 종료하려면: sudo pkill -9 -f 'kubectl port-forward'"
