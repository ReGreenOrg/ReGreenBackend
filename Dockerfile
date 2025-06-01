# Node 이미지 기반
FROM node:20-alpine

# tzdata 설치
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
    && echo "Asia/Seoul" > /etc/timezone \
    && apk del tzdata

# 작업 디렉터리 생성
WORKDIR /usr/src/app

# package.json, package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# NestJS 빌드
RUN npm run build

# Node.js 한국시간 설정
ENV TZ=Asia/Seoul

# 서버 실행
EXPOSE 4000
CMD ["npm", "run", "start:prod"]