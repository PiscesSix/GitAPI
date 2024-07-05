import express from 'express';
const router = express.Router();

import RepoController from '../controllers/commit.js'; 

router.route('/')
    .post(RepoController.getCommits)

router.route('/most-active')
    .post(RepoController.getUserMostActive)


export default router;