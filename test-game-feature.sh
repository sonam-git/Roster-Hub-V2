#!/bin/bash

# Game Feature Test Script
# This script helps verify that game creation is working

echo "🎮 Game Feature Test Script"
echo "=============================="
echo ""

# Check if server is running
echo "📡 Checking if server is running..."
if lsof -i:4000 > /dev/null 2>&1; then
    echo "✅ Server is running on port 4000"
else
    echo "❌ Server is not running!"
    echo "   Start the server first: cd server && node server.js"
    exit 1
fi

echo ""
echo "🔍 Checking server logs for game resolvers..."
if grep -q "Game resolvers integrated" server/server.log 2>/dev/null; then
    echo "✅ Game resolvers are loaded"
else
    echo "⚠️  Game resolvers message not found in logs (might be normal)"
fi

echo ""
echo "📋 Recent server activity:"
echo "---"
tail -n 10 server/server.log 2>/dev/null | sed 's/^/   /'

echo ""
echo "✅ Server Status Check Complete!"
echo ""
echo "📱 Next Steps:"
echo "1. Open the application in your browser"
echo "2. Login to your account"
echo "3. Navigate to 'Game Schedule' or '/game-schedule'"
echo "4. Click 'Create Game' button"
echo "5. Fill in the form:"
echo "   - Date (required)"
echo "   - Time (required)"
echo "   - Venue (required)"
echo "   - City (required - has autocomplete)"
echo "   - Opponent (required)"
echo "   - Notes (optional)"
echo "6. Click 'Submit' or 'Create Game'"
echo ""
echo "Expected Result:"
echo "✅ Game is created successfully"
echo "✅ You're redirected to game details page"
echo "✅ Game appears in the games list"
echo ""
echo "If you see errors:"
echo "- Check browser console (F12)"
echo "- Check server logs: tail -f server/server.log"
echo "- Look for 🎮 emoji in logs for game operations"
echo ""
echo "🔧 Troubleshooting:"
echo "   tail -f server/server.log | grep '🎮'"
echo ""
