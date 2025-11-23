document.addEventListener("DOMContentLoaded", function () {
    const includes = document.querySelectorAll("[include-html]");

    includes.forEach(el => {
        const file = el.getAttribute("include-html");
        fetch(file)
            .then(res => res.text())
            .then(html => {
                el.innerHTML = html;
            })
            .catch(err => {
                el.innerHTML = "Include load error";
            });
    });
});