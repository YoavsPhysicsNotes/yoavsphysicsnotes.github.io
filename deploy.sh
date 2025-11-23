#!/bin/bash

# בניית העץ מחדש - מריץ את הסקריפטים הרלוונטיים
echo "בונה את העץ מחדש..."
python3 build_tree.py  # אם זה Python
node generate-tree.js  # אם זה Node.js (ודא ש-Node מותקן)
./update_tree.sh       # אם זה הסקריפט העיקרי שלך

# עדכון Git עם כל השינויים והקבצים החדשים
echo "מוסיף שינויים ל-Git..."
git add .

# Commit עם הודעה אוטומטית (אתה יכול לשנות)
echo "מבצע commit..."
git commit -m "עדכון אוטומטי: קבצים חדשים ועץ מחודש" || echo "אין שינויים חדשים ל-commit"

# Push ל-GitHub
echo "דוחף ל-GitHub..."
git push origin main  # החלף ב-gh-pages אם זה הענף של GitHub Pages

echo "העדכון הושלם! האתר יתעדכן תוך כמה דקות."