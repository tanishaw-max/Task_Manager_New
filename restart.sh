#!/bin/bash

echo "🔄 Cleaning up..."
# Kill all servers
lsof -ti:5000,5001,5005,5006,5007 2>/dev/null | xargs -r kill -9
sleep 1

# Clear caches
rm -rf frontend/node_modules/.vite frontend/dist

echo "✅ Cleanup complete!"
echo ""
echo "📋 Configuration:"
echo "   Backend: http://localhost:5001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "🚀 Now run these commands in separate terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "   cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo "Login: admin@taskmanager.com / admin123"
