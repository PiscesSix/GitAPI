import { RequestError } from "octokit";
import { Octokit } from "octokit";
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const getCommits = async (req, res) => {
    try {
        const { owner, repo } = req.body
        const response = await octokit.paginate(octokit.rest.repos.listCommits, {
            owner,
            repo,
            per_page: 100
        })
        console.log(response)

        const data = response.map(commit => ({
            committer: commit.commit.author.name,
            message: commit.commit.message
        }))

        console.log(data.length)

        res.status(200).json({
            message: 'Commits fetched successfully',
            data: data
        });
    } catch (error) {
        if (error instanceof RequestError) {
            res.status(error.status).json(error.message);
        } else {
            throw error;
        }
    }
}

const getUserMostActive = async (req, res) => {
    try {
        const { owner, repo, numActiveUser } = req.body
        const response = await octokit.paginate(octokit.rest.repos.listCommits, {
            owner,
            repo,
            per_page: 100
        })

        const data = response.reduce((countCommits, commit) => {
            const committer = commit.commit.author.name;
            countCommits[committer] = (countCommits[committer] || 0) + 1;
            return countCommits;
        }, {});

        const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const mostActiveUsers = sortedData.slice(0, numActiveUser).map(([user, countCommits]) => ({ user, countCommits }));

        res.status(200).json({
            message: 'Commits fetched successfully',
            data: mostActiveUsers
        });
    } catch (error) {
        if (error instanceof RequestError) {
            res.status(error.status).json(error.message);
        } else {
            throw error;
        }
    }
}

export default {
    getCommits,
    getUserMostActive
}
