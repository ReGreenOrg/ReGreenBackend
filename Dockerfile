# 1. Node 이미지 기반
FROM node:20-alpine

# 2. 작업 디렉터리 생성
WORKDIR /usr/src/app

# 3. package.json, package-lock.json 복사
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 소스 코드 복사
COPY . .

# 6. NestJS 빌드
RUN npm run build

# 7. 서버 실행
EXPOSE 4000
CMD ["npm", "run", "start:prod"]