FROM node:22.14.0-alpine

# สร้าง working directory
WORKDIR /usr/src/app

# คัดลอก package.json และ lock ก่อนเพื่อลดการ build ซ้ำ
COPY package*.json ./

# ติดตั้งเฉพาะ production dependencies
RUN npm ci --omit=dev

# คัดลอก src เข้า container
COPY src ./src

# คัดลอก .env ถ้าจำเป็น
# COPY .env .   <-- คุณเลือกใช้ใน docker-compose ผ่าน `env_file` แล้ว ไม่ต้องใช้ตรงนี้ก็ได้

EXPOSE 3000

CMD ["node", "src/server.js"]
