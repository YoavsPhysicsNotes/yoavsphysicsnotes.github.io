/* ===================================================
   main.js — Yoav's Physics Notes
   =================================================== */

const REPO = "YoavsPhysicsNotes/yoavsphysicsnotes.github.io";
const BRANCH = "main";
const TREE_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/tree.json?ts=${Date.now()}`;

/* ---------- URL helpers ---------- */

function encodePath(path) {
  // Encode each segment separately so slashes remain as path separators
  return path.split("/").map(encodeURIComponent).join("/");
}

function rawUrl(node) {
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${encodePath(node.path)}?v=${node.last_modified}`;
}

function blobUrl(node) {
  // GitHub blob viewer — displays PDFs inline in a new tab, no download
  return `https://github.com/${REPO}/blob/${BRANCH}/${encodePath(node.path)}`;
}

/* ---------- Date formatting ---------- */

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ---------- PDF Modal ---------- */

const modal = document.getElementById("pdf-modal");
const overlay = document.getElementById("modal-overlay");
const frame = document.getElementById("pdf-frame");
const modalTitle = document.getElementById("modal-title");
const modalOpenBtn = document.getElementById("modal-open-btn");

function openPreview(node) {
  const url = rawUrl(node);
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  const displayName = node.name.replace(/\.pdf$/i, "");

  modalTitle.textContent = displayName;
  modalOpenBtn.href = url;
  frame.src = viewerUrl;

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
  frame.src = "";
  document.body.style.overflow = "";
}

document.getElementById("modal-close-btn").addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ---------- Render tree ---------- */

function renderPdf(node) {
  const url = rawUrl(node);
  const displayName = node.name.replace(/\.pdf$/i, "");

  const row = document.createElement("div");
  row.className = "pdf-row";
  row.dataset.name = displayName.toLowerCase();

  row.innerHTML = `
    <span class="pdf-icon">📄</span>
    <span class="pdf-name"><a href="${blobUrl(node)}" target="_blank" rel="noopener">${displayName}</a></span>
    <button class="pdf-preview-btn" type="button">תצוגה מקדימה</button>
    <span class="file-date">${formatDate(node.last_modified)}</span>
  `;

  row.querySelector(".pdf-preview-btn").addEventListener("click", () => openPreview(node));
  return row;
}

function renderDir(node) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");

  summary.innerHTML = `<span class="chevron">‹</span><span class="folder-icon">📁</span>${node.name}`;
  details.appendChild(summary);

  const children = document.createElement("div");
  children.className = "folder-children";

  node.children.forEach((child) => {
    if (child.name.startsWith(".")) return;
    children.appendChild(child.type === "dir" ? renderDir(child) : renderPdf(child));
  });

  details.appendChild(children);
  return details;
}

/* ---------- Boot ---------- */

async function load() {
  const container = document.getElementById("tree");

  try {
    const res = await fetch(TREE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tree = await res.json();

    container.innerHTML = "";
    tree.forEach((node) => {
      if (node.name.startsWith(".")) return;
      container.appendChild(node.type === "dir" ? renderDir(node) : renderPdf(node));
    });
  } catch (err) {
    container.innerHTML = `<div id="loading">שגיאה בטעינת הנתונים: ${err.message}</div>`;
  }
}

load();
