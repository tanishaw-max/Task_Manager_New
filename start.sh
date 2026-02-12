#!/bin/bash

# Kill any existing servers
echo "Stopping existing servers..."
lsof -ti:5005,5006,5007 2>/dev/null | xargs -r kill -9
sleep 1

# Start backend
echo "Starting backend on port 5005..."
cd backend
npm run dev
