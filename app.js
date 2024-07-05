import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();
import commitRouter from './routers/commit.js';
import morgan from 'morgan';

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/commits', commitRouter);

app.get('/', (req, res) => {
    res.send('Server is running');
});

const port = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});