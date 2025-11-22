document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[include-html]").forEach(async el => {
        const file = el.getAttribute("include-html");
        try {
            const res = await fetch(file + "?v=" + Date.now());
            if (!res.ok) throw new Error("Failed include");
            el.innerHTML = await res.text();
        } catch (e) {
            el.innerHTML = "<!-- include failed -->";
        }
    });
});
