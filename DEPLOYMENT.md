# Task Manager - Deployment Guide

## 🚀 Quick Start

### Local Development

#### Backend (Port 5001)
```bash
cd backend
npm install
npm run dev
```

#### Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

The app will automatically use:
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`

---

## 🌐 Production Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Environment Variables** - Set these in your hosting platform:
   ```
   MONGO_URI=mongodb+srv://tanishaw_db_user:tanisha123@cluster0.ezrjvsi.mongodb.net/taskmanager?retryWrites=true&w=majority
   JWT_SECRET=tannu2003@1231
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://task-manager-new-seven.vercel.app
   ```

2. **Deploy Command**:
   ```bash
   npm install && npm start
   ```

3. **Note your backend URL** (e.g., `https://taskmanager-o4rm.onrender.com`)

---

### Frontend Deployment (Vercel)

1. **Update `.env.production`** with your backend URL:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Deploy to Vercel**:
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Or via Vercel Dashboard**:
   - Connect your GitHub repo
   - Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`
   - Deploy

---

## 🔧 Port Configuration

### If Port 5000 is Busy

The backend automatically tries the next available port (5001, 5002, etc.).

**Manual Port Change**:
1. Update `backend/.env`:
   ```
   PORT=5001
   ```

2. Update `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:5001
   ```

3. Restart both servers

---

## 📝 Environment Files

### Backend
- `.env` - Current active configuration
- `.env.local` - Local development (PORT=5001)
- `.env.production` - Production deployment (PORT=5000)

### Frontend
- `.env` - Current active configuration
- `.env.local` - Local development (localhost:5001)
- `.env.production` - Production (your deployed backend URL)

---

## 🔗 Production URLs

- **Frontend**: https://task-manager-new-seven.vercel.app
- **Backend**: https://taskmanager-o4rm.onrender.com
  - Alternative: https://task-manager-new-9d3y.onrender.com

---

## ⚠️ Troubleshooting

### Timeout Error (10000ms exceeded)
- Check if backend is running
- Verify `VITE_API_URL` points to correct backend
- Ensure CORS is configured for your frontend URL

### Port Already in Use
- Backend automatically tries next port
- Or manually change PORT in `.env`
- Kill existing process: `pkill -f "node.*backend"`

### CORS Error
- Add your frontend URL to `CORS_ORIGIN` in backend `.env`
- Multiple origins: `CORS_ORIGIN=http://localhost:5173,https://your-app.vercel.app`
