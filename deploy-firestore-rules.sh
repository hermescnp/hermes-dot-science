#!/bin/bash

# Deploy Firestore Rules
echo "🚀 Deploying Firestore rules..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    echo "Then run: firebase login"
    exit 1
fi

# Deploy the rules
firebase deploy --only firestore:rules

echo "✅ Firestore rules deployed successfully!"
echo "🔗 You can view your rules in the Firebase Console:"
echo "https://console.firebase.google.com/project/dot-science/firestore/rules" 