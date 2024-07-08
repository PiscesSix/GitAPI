dotenv = require("dotenv").config();
var parse = require("parse-link-header");
const PER_PAGE = 100;

class RepoGitHub {
    constructor(nameRepo = null, nameOwner = null, token = null) {
        this.nameRepo = nameRepo;
        this.nameAuthor = nameOwner;
        this.headers = {
            "X-GitHub-Api-Version": "2022-11-28",
            accept: "application/vnd.github+json",
            Authorization: `token ${token}`,
        };
        this.urlCommit = `https://api.github.com/repos/${this.nameAuthor}/${this.nameRepo}/commits`;
        this.commits = [new Commit()];
    }

    getNameRepo() {
        return this.nameRepo;
    }

    getNameAuthor() {
        return this.nameOwner;
    }

    getHeaders() {
        return this.headers;
    }

    getCommitUrl(per_page, page) {
        return `${this.urlCommit}?per_page=${per_page}&page=${page}`;
    }

    async getAllCommits() {
        try {
            let page = 1;
            const response = await fetch(this.getCommitUrl(PER_PAGE, page), {
                method: "GET",
                headers: this.headers,
            });

            const data_json = await response.json();
            let result = data_json.map(
                (commit) =>
                    new Commit(commit.commit.author.name, commit.commit.message)
            );

            const lastPage = parse(response.headers.get("link")).last.page;
            if (!lastPage) {
                return this.commits = result;
            }

            for (page = 2; page <= lastPage; page++) {
                const response = await fetch(
                    this.getCommitUrl(PER_PAGE, page),
                    {
                        method: "GET",
                        headers: this.headers,
                    }
                );

                const data_json = await response.json();
                
                result = result.concat(
                    data_json.map(
                        (commit) =>
                            new Commit(
                                commit.commit.author.name,
                                commit.commit.message
                            )
                    )
                );
            }

            return this.commits = result;
        } catch (error) {
            console.log(error);
        }
    }
}

class Commit {
    constructor(author = null, message = null) {
        this.author = author;
        this.message = message;
    }
}

async function getUniqueUsers(listCommits) {
    let users = [];
    listCommits.forEach((commit) => {
        if (!users.includes(commit.author)) {
            users.push(commit.author);
        }
    });
    return users;
}

async function getMostUserCommits(listCommits) {
    let count = {};
    listCommits.forEach((commit) => {
        if (!count[commit.author]) {
            count[commit.author] = 1;
        } else {
            count[commit.author]++;
        }
    });

    let max = 0;
    let user = "";
    for (let key in count) {
        if (count[key] > max) {
            max = count[key];
            user = key;
        }
    }

    return {user: user, count: max};
}

async function main() {
    const repo = new RepoGitHub(
        "swift-stress-tester",
        "swiftlang",
        process.env.GITHUB_TOKEN
    );
    const allcommits = await repo.getAllCommits();
    const uniqueUsers = await getUniqueUsers(allcommits);
    const mostUserCommits = await getMostUserCommits(allcommits);

    console.log(`All commits:`, allcommits);
    console.log(`Number of commits:`, allcommits.length);
    console.log(`Users commit:`,uniqueUsers)
    console.log(`Most user commit:`, mostUserCommits)
}

main();
