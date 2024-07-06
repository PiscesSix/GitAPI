dotenv = require('dotenv').config();
var parse = require('parse-link-header');
const PER_PAGE = 100
const COMMIT_URL = `https://api.github.com/repos/${this.nameAuthor}/${this.getNameRepo}/commits`

class ResponseGitHub {
    constructor(nameRepo=null, nameOwner=null, token=null) {
        this.nameRepo = nameRepo;
        this.nameAuthor = nameOwner;
        this.headers = {
            'X-GitHub-Api-Version': '2022-11-28',
            'accept': 'application/vnd.github+json',
            'Authorization': `token ${token}`
        }
    }

    getNameRepo() {
        return this.nameRepo;
    }

    getNameAuthor() {
        return this.nameOwner;
    }

    async getAllCommits() {
        try {
            let page = 1
            const response = await fetch(
                `https://api.github.com/repos/${this.nameAuthor}/${this.nameRepo}/commits`,
                {   
                    method: 'GET',
                    headers: this.headers,
                    per_page: PER_PAGE,
                    page: page
                })

            const allCommits = await response.json();
            const result = {
                commits: allCommits.map(commit => ({
                    author: commit.commit.author.name,
                    message: commit.commit.message
                }))
            };

            const link = response.headers.get('link');
            var parsed = parse(link)
            const lastPage = parsed.last.page

            page += 1
            for (page; page <= lastPage; page++) {
                const response = await fetch(
                    `https://api.github.com/repos/${this.nameAuthor}/${this.nameRepo}/commits`,
                    {   
                        method: 'GET',
                        headers: this.headers,
                        per_page: PER_PAGE,
                        page: page
                    })
                const allCommits = await response.json();

                result.commits = result.commits.concat(allCommits.map(commit => ({
                    author: commit.commit.author.name,
                    message: commit.commit.message
                })))
            }
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    async getUniqueUsers() {
        const allCommits = await this.getAllCommits();
        const uniqueUsers = [];
        allCommits.commits.forEach(commit => {
            if (!uniqueUsers.includes(commit.author)) {
            uniqueUsers.push(commit.author);
            }
        });
        return uniqueUsers;
    }

    async getMostUserCommits() {
        const allCommits = await this.getAllCommits();
        const users = {};
        allCommits.commits.forEach(commit => {
            if (users[commit.author]) {
                users[commit.author] += 1;
            } else {
                users[commit.author] = 1;
            }
        });

        let maxUser = '';
        let maxCommits = 0;
        for (const user in users) {
            if (users[user] > maxCommits) {
            maxUser = user;
            maxCommits = users[user];
            }
        }
        return maxUser;
    }
}


async function main() {
    const response = new ResponseGitHub('swift-integration-tests', 'swiftlang', process.env.GITHUB_TOKEN);
    const allcommits = await response.getAllCommits();
    const uniqueUsers = await response.getUniqueUsers();
    const mostUserCommits = await response.getMostUserCommits();

    console.log(`All commits:`,allcommits);
    console.log(`Number of commits:`, allcommits.commits.length);
    console.log(`Users commit:`,uniqueUsers)
    console.log(`Most user commit:`, mostUserCommits)
}

main();