#!/bin/bash
echo "🔌 포트 포워딩 시작..."

# 기존 포트 포워딩 프로세스가 있으면 정리
pkill -f "kubectl port-forward" 2>/dev/null

# 백그라운드로 포트 포워딩 실행
kubectl port-forward svc/node-app-service 3000:3000 --address 0.0.0.0 &
kubectl port-forward svc/spring-boot-service 8080:8080 --address 0.0.0.0 &

echo ""
echo "✅ 포트 포워딩 완료!"
echo "   - 프론트엔드: http://리눅스IP:3000"
echo "   - 백엔드:     http://리눅스IP:8080"
echo "   - Jenkins:    http://리눅스IP:8090"
echo ""
echo "💡 포트 포워딩 종료하려면: pkill -f 'kubectl port-forward'"
