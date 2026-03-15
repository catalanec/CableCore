#!/bin/bash
# CableCore — Push to GitHub
# Run this script to push your code to GitHub
# Usage: bash push.sh YOUR_GITHUB_TOKEN

TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "❌ Usage: bash push.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "📝 Steps to get a token:"
    echo "1. Go to github.com/settings/tokens"  
    echo "2. Create/edit a Fine-grained token"
    echo "3. Repository permissions → Contents → Read and write"
    echo "4. Copy the token and run: bash push.sh ghp_xxxxx"
    exit 1
fi

git remote set-url origin https://x-access-token:${TOKEN}@github.com/catalanec/CableCore.git
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code pushed to GitHub!"
    echo "🚀 Next: go to vercel.com → Add New Project → import catalanec/CableCore"
else
    echo ""
    echo "❌ Push failed. Make sure your token has 'Contents: Read and write' permission."
fi
