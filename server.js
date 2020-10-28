const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log('Uncaught ExceptionShutting down the server');
  console.log(`${err.name}:${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

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

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server running on port : ${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recieved');
  server.close(() => {
    console.log('process terminated');
  });
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandeled Rejection Shutting down the server');
  console.log(`${err.name}:${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
