# 문의하기 웹 애플리케이션

이 프로젝트는 문의 폼과 관리자 페이지를 제공하는 웹 애플리케이션입니다.

## 기능

- 문의 폼 제출
- 관리자 이메일로 알림 발송
- 관리자 페이지에서 문의 내역 확인
- 실시간 문의 목록 업데이트

## 기술 스택

- Node.js
- Express
- PostgreSQL
- Nginx

## 설치 방법

1. 저장소 클론
```bash
git clone [repository-url]
cd mailform
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 열어 필요한 설정값을 입력하세요
```

4. PostgreSQL 데이터베이스 생성 및 테이블 설정
```bash
psql -U postgres
CREATE DATABASE mailform;
\c mailform
\i schema.sql
```

5. 애플리케이션 실행
```bash
npm start
```

## Nginx 설정

```nginx
server {
    listen 80;
    server_name diyme66.shop;
    
    # HTTP를 HTTPS로 리다이렉트
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name diyme66.shop;

    # SSL 인증서 설정
    ssl_certificate /etc/letsencrypt/live/diyme66.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/diyme66.shop/privkey.pem;
    
    # SSL 설정 최적화
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # HSTS 설정
    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 사용 방법

1. 문의 폼 접속: `https://diyme66.shop`
2. 관리자 페이지 접속: `https://diyme66.shop/admin.html`

## 주의사항

1. `.env` 파일의 보안을 위해 반드시 `.gitignore`에 추가하세요.
2. SMTP 설정 시 Gmail을 사용하는 경우, 앱 비밀번호를 생성하여 사용하세요.
3. 프로덕션 환경에서는 보안을 위해 관리자 페이지에 인증을 추가하는 것을 권장합니다.
4. SSL 인증서는 Let's Encrypt를 통해 발급받아 사용하세요. #   m a i l f o r m _ t e s t  
 #   m a i l f o r m  
 #   m a i l f o r m  
 #   m a i l f o r m  
 #   m a i l f o r m  
 #   m a i l f o r m  
 #   m a i l f o r m  
 