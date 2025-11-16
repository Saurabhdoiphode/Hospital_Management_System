#!/bin/bash

echo "========================================"
echo "Starting Hospital Management System"
echo "========================================"
echo ""
echo "Step 1: Starting Backend Server..."
echo ""

# Start server in background
npm run server &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

echo ""
echo "Step 2: Starting Frontend Client..."
echo ""

# Start client
npm run client

# When client stops, kill server
kill $SERVER_PID 2>/dev/null

echo ""
echo "Servers stopped."
echo ""

