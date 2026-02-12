# Quick Environment Switch Guide

## 🏠 Local Development

### Start Backend (Port 5001)
```bash
cd backend
npm run dev
```

### Start Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

**Current Config:**
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`
- Database: MongoDB Atlas (Cloud)

---

## 🌐 Production Deployment

### Backend (Render/Railway)
**Environment Variables:**
```env
MONGO_URI=mongodb+srv://tanishaw_db_user:tanisha123@cluster0.ezrjvsi.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=tannu2003@1231
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://task-manager-new-seven.vercel.app
```

### Frontend (Vercel)
**Environment Variables:**
```env
VITE_API_URL=https://taskmanager-o4rm.onrender.com
```
(or your actual backend URL)

---

## 🔄 Switch Environments

### To Production:
```bash
# Frontend
cd frontend
cp .env.production .env
npm run build
vercel --prod

# Backend - Set env vars in hosting platform dashboard
```

### Back to Local:
```bash
# Frontend
cd frontend
cp .env.local .env
npm run dev

# Backend
cd backend
cp .env.local .env
npm run dev
```

---

## 📋 Checklist Before Deployment

### Backend:
- [ ] Update `CORS_ORIGIN` with your Vercel frontend URL
- [ ] Set `NODE_ENV=production`
- [ ] Verify MongoDB connection string
- [ ] Set all environment variables in hosting platform

### Frontend:
- [ ] Update `VITE_API_URL` with deployed backend URL
- [ ] Test API connection
- [ ] Build and deploy: `npm run build && vercel --prod`

---

## 🔗 Your URLs

**Production:**
- Frontend: https://task-manager-new-seven.vercel.app
- Backend: https://taskmanager-o4rm.onrender.com

**Local:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5001
