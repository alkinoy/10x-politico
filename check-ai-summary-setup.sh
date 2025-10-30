#!/bin/bash

# AI Summary Feature - Setup Checker
# Run this script to verify your environment is configured correctly

echo "🔍 Checking AI Summary Feature Setup..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "   Create one with: touch .env"
    echo ""
    exit 1
else
    echo "✅ .env file found"
fi

# Check USE_AI_SUMMARY
if grep -q "^USE_AI_SUMMARY=true" .env; then
    echo "✅ USE_AI_SUMMARY is set to 'true'"
elif grep -q "^USE_AI_SUMMARY=" .env; then
    VALUE=$(grep "^USE_AI_SUMMARY=" .env | cut -d'=' -f2)
    echo "⚠️  USE_AI_SUMMARY is set to: '$VALUE'"
    echo "   It should be set to: 'true' (lowercase)"
else
    echo "❌ USE_AI_SUMMARY is not set"
    echo "   Add this line to .env:"
    echo "   USE_AI_SUMMARY=true"
fi

echo ""

# Check OPENROUTER_API_KEY
if grep -q "^OPENROUTER_API_KEY=" .env; then
    KEY=$(grep "^OPENROUTER_API_KEY=" .env | cut -d'=' -f2)
    if [ -z "$KEY" ]; then
        echo "❌ OPENROUTER_API_KEY is empty"
        echo "   Get an API key from: https://openrouter.ai/"
    else
        echo "✅ OPENROUTER_API_KEY is set"
        # Show first few characters only
        echo "   Key starts with: ${KEY:0:15}..."
    fi
else
    echo "❌ OPENROUTER_API_KEY is not set"
    echo "   Add this line to .env:"
    echo "   OPENROUTER_API_KEY=your_api_key_here"
fi

echo ""
echo "---"
echo ""

# Summary
echo "📋 Quick Setup Guide:"
echo ""
echo "1. Ensure .env file has these lines:"
echo "   USE_AI_SUMMARY=true"
echo "   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxx"
echo ""
echo "2. Restart your dev server:"
echo "   npm run dev"
echo ""
echo "3. Create a new statement and watch the console logs"
echo ""
echo "For detailed troubleshooting, see:"
echo ".ai/ai-summary-troubleshooting.md"

