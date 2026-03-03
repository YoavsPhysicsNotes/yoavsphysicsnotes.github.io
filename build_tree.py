import os
import json
import subprocess
from datetime import datetime
from urllib.parse import quote

ROOT = "."

IGNORE = {
    "node_modules", "package.json", "package-lock.json",
    "build_tree.py", "generate-tree.js", "README.md",
    "deploy.sh", "update_tree.sh", ".github",
    "main.js", "style.css", "include.js",
    "favicon.png", "logo.png",
}


def get_last_modified(path):
    """Returns last-modified date from Git history, falls back to filesystem mtime."""
    try:
        result = subprocess.check_output(
            ["git", "log", "-1", "--format=%ci", "--", path],
            stderr=subprocess.STDOUT,
        ).decode().strip()
        if result:
            return result
    except subprocess.CalledProcessError:
        pass

    try:
        ts = os.path.getmtime(path)
        return datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return None


def make_raw_url(rel_path):
    """Build a properly-encoded raw GitHub URL for a repository file."""
    encoded = "/".join(quote(seg) for seg in rel_path.split("/"))
    return (
        "https://raw.githubusercontent.com/"
        "YoavsPhysicsNotes/yoavsphysicsnotes.github.io/main/"
        + encoded
    )


def scan_directory(path):
    """Recursively scan a directory and return a tree of dirs and PDFs."""
    items = []
    try:
        entries = sorted(os.listdir(path))
    except PermissionError:
        return items

    for name in entries:
        if name.startswith(".") or name in IGNORE:
            continue

        full_path = os.path.join(path, name)
        rel_path = full_path.replace("./", "")

        if os.path.isdir(full_path):
            children = scan_directory(full_path)
            if children:  # skip empty dirs
                items.append({
                    "type": "dir",
                    "name": name,
                    "path": rel_path,
                    "children": children,
                })

        elif name.lower().endswith(".pdf"):
            items.append({
                "type": "pdf",
                "name": name,
                "path": rel_path,
                "download_url": make_raw_url(rel_path),
                "last_modified": get_last_modified(full_path),
            })

    return items


def main():
    tree = scan_directory(ROOT)
    with open("tree.json", "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)
    print("tree.json updated successfully.")


if __name__ == "__main__":
    main()
