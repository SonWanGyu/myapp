# 🌍 TravelVibe - AI 맞춤형 여행 일정 플래너

AI 기술을 활용하여 사용자에게 최적의 여행 일정을 제안하고 관리해 주는 지능형 여행 플래너 서비스입니다.  
사용자의 취향(대륙, 국가, 도시, 기간, 인원, 스타일, 템포 등)을 분석하여 Google Gemini AI를 통해 세상에 하나뿐인 일정을 생성합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Infrastructure & CI/CD
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=Jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=Kubernetes&logoColor=white)

### Frontend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)

### Backend
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=Spring_Boot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=Spring_Security&logoColor=white)
![Spring Batch](https://img.shields.io/badge/Spring_Batch-6DB33F?style=for-the-badge&logo=Spring_Batch&logoColor=white)
![Hibernate](https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=Hibernate&logoColor=white)

### Database & AI
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=Oracle&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=Google_Gemini&logoColor=white)

---

## 📐 아키텍처 다이어그램 (Architecture Diagram)

```mermaid
graph TD
    User([사용자])
    
    subgraph "Frontend Layer (Node.js/Next.js)"
        NextApp[Next.js App Router]
        ReactUI[React / TypeScript Components]
    end
    
    subgraph "Backend Layer (Spring Boot)"
        API[REST Controller]
        Sec[Spring Security / JWT]
        Batch[Spring Batch]
        Service[Business Logic]
        JPA[Spring Data JPA / Hibernate]
    end
    
    subgraph "Infrastructure (K8s/Docker)"
        K8s[Kubernetes Cluster]
        Jenkins[Jenkins Pipeline]
        Registry[Docker Registry]
    end
    
    subgraph "Data & AI"
        Oracle[(Oracle DB 19c)]
        Gemini[Google Gemini AI]
        GMap[Google Maps API]
    end

    User <--> NextApp
    NextApp <--> API
    API <--> Sec
    API <--> Service
    Service <--> JPA
    JPA <--> Oracle
    Service <--> Gemini
    Batch <--> Oracle
    NextApp <--> GMap

    Jenkins --> Registry
    Registry --> K8s
    K8s -.-> NextApp
    K8s -.-> API
    K8s -.-> Oracle
```

---

## ✨ 핵심 기능 (Key Features)

- 🤖 **AI 맞춤 일정 생성**: 대륙, 국가, 도시 선택부터 여행 스타일, 동행자, 템포까지 고려한 AI(Gemini) 기반 일정 생성.
- 📍 **인터랙티브 지도**: 생성된 각 장소를 Google Maps와 연동하여 위치를 시각화하고 이동 경로(거리)를 표시.
- 🗓️ **일정 관리**: 나만의 여행 계획을 저장하고, 마이페이지에서 언제든지 확인 및 관리 기능 제공.
- 🔐 **보안 및 인증**: JWT 기반의 Spring Security를 통해 안전한 회원 관리 및 데이터 보호.
- ⚙️ **CI/CD 자동화**: Jenkins 파이프라인을 통해 Docker 빌드 및 Kubernetes 배포 자동화.

---

## 📁 프로젝트 구조 (Project Structure)

```text
myFirstAntigravityProject/
├── myapp/
│   ├── node-app/           # Next.js 프론트엔드
│   ├── spring-boot/        # 메인 백엔드 API 서버
│   ├── spring-batch-app/   # 배치 처리 어플리케이션
│   ├── jenkins/            # Jenkins 설정 및 Dockerfile
│   ├── k8s/                # Kubernetes Deployment/Service YAML
│   └── docker-compose.ci.yml
├── restart.sh              # 자동 기동 스크립트
├── portforward.sh          # 로컬 포트포워딩 스크립트
└── README.md
```

---

## 🚀 시작하기 (Getting Started)

### 사전 요구 사항
- Docker Desktop
- Minikube
- Node.js (v18+)
- Java (v15+)

### 실행 방법
1. **서버 총괄 기동**
   ```bash
   cd ~/myapp && bash restart.sh
   ```
2. **포트 포워딩 설정 (필수)**
   ```bash
   # 터미널 A (프론트엔드)
   kubectl port-forward svc/node-app-service 3000:3000 --address 0.0.0.0
   
   # 터미널 B (백엔드)
   kubectl port-forward svc/spring-boot-service 8080:8080 --address 0.0.0.0
   ```
3. **접속 주소**
   - 프론트엔드: `http://localhost:3000`
   - 백엔드 API: `http://localhost:8080`
   - Jenkins: `http://localhost:8090`

---

## 🤝 CI/CD 파이프라인
프로젝트는 **Jenkins Pipeline (Groovy)**를 사용하여 지속적 통합 및 배포를 수행합니다.
1. Git Commit & Push
2. Jenkins Webhook 트리거
3. Docker Image 빌드 및 Push (Local Registry)
4. Minikube Kubernetes 리소스 업데이트 및 Rolling Update 수행

---

## 🛡️ 라이선스
- 이 프로젝트는 학습 프로젝트의 일환으로 제작되었습니다.
