# Quan ly thu chi
Ung dung fullstack ghi nhan thu/chi, quan ly vi tien va sinh bao cao theo thoi gian thuc. Client viet bang React + TypeScript, server bang Node.js/Express va MongoDB, dong goi bang Docker Compose.

## Cong nghe chinh
- Client: React, Vite, TypeScript, Ant Design, React Query, Recharts.
- Server: Node.js, Express, TypeScript, MongoDB/Mongoose, google-auth-library.
- Trien khai: Docker Compose (client, server, MongoDB).

## Cau truc thu muc
- `client/`: giao dien nguoi dung Vite.
- `server/`: API Express, xac thuc Google, quan ly du lieu.
- `docker-compose.yml`: chay toan bo he thong + MongoDB.

## Yeu cau moi truong
- Docker Desktop (ho tro Docker Compose v2).
- (Khuyen nghi) Node.js >= 18 neu ban muon chay script ho tro ngoai container.
- Tai khoan Google Cloud de tao OAuth Client ID/Client Secret.

## Cai dat & chay bang Docker Compose
1. Tao file moi truong:
   - `cp server/.env.example server/.env`
   - `cp client/.env.example client/.env`
2. Dien cac gia tri theo bang ben duoi (dac biet la Google Client ID va Mongo URI neu dung Atlas).
3. (Tuy chon) Set env toan cuc truoc khi chay Docker neu khong muon ghi vao file `.env`, vi du PowerShell:
   ```powershell
   $env:GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
   ```
4. Xay dung va chay ca he thong:
   ```bash
   docker compose up --build
   ```
   - Client: http://localhost:4173
   - Server API: http://localhost:5000
   - MongoDB: cong 27017 (nam trong docker network, dung `mongo-express` hoac Compass voi URI mongod-db:27017 neu muon ket noi tu may chu)

### Bien moi truong
**server/.env**
```ini
PORT=5000                      # Cong API
MONGO_URI=mongodb://127.0.0.1:27017/quan-ly-chi-tieu
JWT_SECRET=thay-bang-chuoi-du-doan-kho
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
CLIENT_ORIGIN=http://localhost:5173  # Hoac http://localhost:4173 khi dung Docker
```

**client/.env**
```ini
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

> Luu y: `GOOGLE_CLIENT_ID` phai giong nhau o server va client vi server dung de verify id token do Google tra ve.

> Neu ban can build thu cong (khong qua Docker) co the dung `npm run build`, nhung quy trinh chinh khuyen nghi su dung `docker compose`.

## Cau hinh Google OAuth (Client ID & Client Secret)
1. Dang nhap https://console.cloud.google.com/ va tao project (neu chua co).
2. Vao `APIs & Services > OAuth consent screen` va hoan tat cac buoc bat buoc, them scope `email`, `profile`. Neu chi dung noi bo co the chon `Internal`.
3. Vao `APIs & Services > Credentials > Create credentials > OAuth client ID`.
4. Chon loai `Web application`, dat ten de de nhan dien (vi du `QuanLyChiTieu-local`).
5. Them `Authorized JavaScript origins`:
   - `http://localhost:5173` (Vite dev)
   - `http://localhost:4173` (ban build + Docker)
6. Them `Authorized redirect URIs`:
   - `http://localhost:5173` (su dung implicit flow cua `@react-oauth/google`)
   - Them cac domain deploy that neu co (vi du `https://app.quanlychitieu.vn`).
7. Bam `Create` de nhan ve `Client ID` va `Client Secret`.
8. Gan `Client ID` cho ca `VITE_GOOGLE_CLIENT_ID` (client) va `GOOGLE_CLIENT_ID` (server). Giữ `Client Secret` an toan (khong commit). Hien tai ung dung dung implicit flow nen chi can Client ID, nhung Client Secret van can thiet neu ban mo rong sang server-side code exchange trong tuong lai.
9. Neu chay bang Docker, export env truoc khi goi `docker compose up`:
   ```bash
   $env:GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
   docker compose up --build
   ```

## Cac lenh huu ich
- `npm run lint`: chay lint ca hai workspace.
- `npm run format`: format code bang cac cong cu da cau hinh trong client/server.
- `npm --workspace server run test`: (them neu co test unit sau nay).

## Ghi chu them
- Khong commit file `.env` len repo cong khai.
- Khi deploy, nho cap nhat `CLIENT_ORIGIN` va `VITE_API_BASE_URL` bang domain thuc te.
- MongoDB co the chay bang Atlas. Chi can doi `MONGO_URI` sang connection string tuong ung.
