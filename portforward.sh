#!/bin/bash
echo "🔌 포트 포워딩 시작..."

# 백그라운드 명령어(&)에서 sudo 비밀번호 입력 대기 상태로 멈추는 것을 방지
sudo -v

# 기존 포트 포워딩 프로세스가 있으면 관리자 권한으로 정리 (미리 입력한 비밀번호 덕에 바로 실행됨)
sudo pkill -f "kubectl port-forward" 2>/dev/null

# 백그라운드로 포트 포워딩 실행
# 80포트(HTTP 기본)로 연결하기 위해 sudo를 쓰지만, 설정 파일을 놓치지 않도록 --kubeconfig 명시
sudo kubectl --kubeconfig=$HOME/.kube/config port-forward svc/node-app-service 80:3000 --address 0.0.0.0 &
kubectl port-forward svc/spring-boot-service 8080:8080 --address 0.0.0.0 &

echo ""
echo "✅ 포트 포워딩 완료!"
echo "   - 프론트엔드: http://리눅스IP  (포트 없이 접속!)"
echo "   - 백엔드:     http://리눅스IP:8080"
echo "   - Jenkins:    http://리눅스IP:8090"
echo ""
echo "💡 포트 포워딩 종료하려면: sudo pkill -f 'kubectl port-forward'"
