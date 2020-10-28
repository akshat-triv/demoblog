const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Article = require('./models/articleModel');
const mongoose = require('mongoose');

let data = fs.readFileSync('./public/dummy.json', 'utf-8');

data = JSON.parse(data);

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DB_PASS
).replace('<dbname>', 'blog');

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DataBase is connected');
  });

async function name() {
  await Article.create(data);
}

name();
