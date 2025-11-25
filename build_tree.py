import os
import json
import subprocess
from datetime import datetime

ROOT = "."  # הסקריפט רץ בתיקיית הריפו

IGNORE = {"node_modules", "package.json", "package-lock.json", "build_tree.py", "generate-tree.js", "README.md"}

def get_last_modified(path):
    """מחזיר תאריך עדכון מ-Git, ואם אין — תאריך יצירת הקובץ"""
    try:
        result = subprocess.check_output(
            ["git", "log", "-1", "--format=%ci", "--", path],
            stderr=subprocess.STDOUT
        ).decode().strip()

        if result:
            return result
    except subprocess.CalledProcessError:
        pass  # ננסה fallback

    # fallback: תאריך קובץ בפועל
    try:
        ts = os.path.getmtime(path)
        return datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")
    except:
        return None

def scan_directory(path):
    """סורק תיקייה ובונה עץ רקורסיבי"""
    items = []
    for name in sorted(os.listdir(path)):
        if name.startswith("."):
            continue  # לא להציג תיקיות מערכת כמו .idea, .git וכו'

        if name in IGNORE:
            continue

        full_path = os.path.join(path, name)

        if os.path.isdir(full_path):
            items.append({
                "type": "dir",
                "name": name,
                "path": full_path.replace("./", ""),
                "children": scan_directory(full_path)
            })

        elif name.lower().endswith(".pdf"):
            items.append({
                "type": "pdf",
                "name": name,
                "path": full_path.replace("./", ""),
                "download_url": f"https://raw.githubusercontent.com/YoavsPhysicsNotes/yoavsphysicsnotes.github.io/main/{full_path.replace('./', '')}",
                "last_modified": get_last_modified(full_path)
            })

    return items

def main():
    tree = scan_directory(ROOT)

    # כותבים לקובץ JSON
    with open("tree.json", "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)

    print("tree.json updated successfully.")

if __name__ == "__main__":
    main()