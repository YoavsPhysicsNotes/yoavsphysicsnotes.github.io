const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const owner = "YoavsPhysicsNotes";
const repo = "yoavsphysicsnotes.github.io";

const IGNORE = ["node_modules", ".idea", ".git", ".github"];

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined
});

async function getTree(path = "") {
    const res = await octokit.repos.getContent({ owner, repo, path });
    const items = Array.isArray(res.data) ? res.data : [res.data];

    const tree = [];

    for (const item of items) {
        if (IGNORE.includes(item.name)) continue;

        if (item.type === "dir") {
            tree.push({
                type: "dir",
                name: item.name,
                path: item.path,
                children: await getTree(item.path)
            });
        } else if (item.type === "file" && item.name.toLowerCase().endsWith(".pdf")) {
            const lastMod = await octokit.repos.getCommit({
                owner,
                repo,
                ref: item.sha
            });

            tree.push({
                type: "pdf",
                name: item.name,
                path: item.path,
                last_modified: lastMod.data.commit.author.date,
                download_url: `${item.download_url}?v=${item.sha}`
            });
        }
    }

    tree.sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;

        if (a.type === "pdf") {
            return new Date(b.last_modified) - new Date(a.last_modified);
        }

        return a.name.localeCompare(b.name, "he");
    });

    return tree;
}

(async () => {
    const tree = await getTree("");
    fs.writeFileSync("tree.json", JSON.stringify(tree, null, 2));
    console.log("tree.json generated!");
})();