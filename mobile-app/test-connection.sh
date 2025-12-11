#!/bin/bash

# Test script to diagnose Expo connection issues
echo "================================================"
echo "Expo Connection Diagnostic Tool"
echo "================================================"
echo ""

# Check if Metro is running
echo "1. Checking Metro bundler..."
if curl -s http://localhost:8081/status | grep -q "running"; then
    echo "   ✅ Metro bundler is running"
else
    echo "   ❌ Metro bundler is NOT running"
    echo "   Run: npx expo start"
    exit 1
fi

# Get local IP
echo ""
echo "2. Network Information:"
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "   Local IP: $LOCAL_IP"
echo "   Metro URL: http://$LOCAL_IP:8081"
echo "   Expo URL: exp://$LOCAL_IP:8081"

# Check if port 8081 is accessible
echo ""
echo "3. Testing network accessibility..."
if curl -s -m 2 http://$LOCAL_IP:8081/status | grep -q "running"; then
    echo "   ✅ Metro is accessible from local network"
else
    echo "   ⚠️  Metro may not be accessible from other devices"
fi

# Check firewall
echo ""
echo "4. Checking firewall status..."
FW_STATUS=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate)
echo "   $FW_STATUS"

echo ""
echo "================================================"
echo "MANUAL CONNECTION STEPS:"
echo "================================================"
echo "1. Make sure your iPhone is on the SAME WiFi as your Mac"
echo "2. Open Expo Go on your iPhone"
echo "3. Tap 'Enter URL manually'"
echo "4. Type this EXACT URL:"
echo ""
echo "   exp://$LOCAL_IP:8081"
echo ""
echo "5. Press Connect"
echo "================================================"
