FROM jenkins/jenkins:lts

USER root

# Docker CLI 설치 (호스트의 Docker 데몬을 조종하기 위해 필요)
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

# kubectl 설치 (쿠버네티스 클러스터에 배포하기 위해 필요)
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install kubectl /usr/local/bin/kubectl && \
    rm kubectl

USER root
