#!/bin/bash

echo "🔄 Running build_tree.py..."
python3 build_tree.py || { echo "❌ build_tree.py failed"; exit 1; }

echo "📌 Adding all changes to Git..."
git add .

echo "📝 Creating commit..."
git commit -m "Auto update: PDFs + tree.json" || echo "ℹ️ No new changes to commit"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Deployment finished! tree.json is now up to date."
