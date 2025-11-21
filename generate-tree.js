const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const owner = "YoavsPhysicsNotes";
const repo = "yoavsphysicsnotes.github.io";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined
});

async function getTree(path = "") {
    const res = await octokit.repos.getContent({ owner, repo, path });
    const items = Array.isArray(res.data) ? res.data : [res.data];

    const tree = [];

    for (const item of items) {
        if (item.type === "dir") {
            tree.push({
                type: "dir",
                name: item.name,
                path: item.path,
                children: await getTree(item.path)
            });
        } else if (item.type === "file" && item.name.toLowerCase().endsWith(".pdf")) {
            tree.push({
                type: "pdf",
                name: item.name,
                path: item.path,
                download_url: item.download_url
            });
        }
    }

    return tree;
}

(async () => {
    const tree = await getTree("");
    fs.writeFileSync("tree.json", JSON.stringify(tree, null, 2));
    console.log("tree.json generated!");
})();