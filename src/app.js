const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/v1/users');
const exercisesRoutes = require('./routes/v1/exercises');
const setsRoutes = require('./routes/v1/sets');

const { serverPort } = require('./config');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  res.send({ msg: 'Server is running...' });
});

app.use('/v1/users', userRoutes);
app.use('/v1/exercises', exercisesRoutes);
app.use('/v1/sets', setsRoutes);

// app.all('*', (req, res) => {
//   res.status(404).send({ err: 'Page not found' });
// });

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});

// const checkTablesStatus = async () => {
//   const con = await mysql.createConnection(mysqlConfig);
//   const [data] = await con.execute(`SHOW TABLES`);
//   console.log(data);
//   if (data.length === 0) {
//     console.log('All good');
//     const con = await mysql.createConnection(mysqlConfig);
//     const [data] = await con.execute(`
//     INSERT INTO users (name, email)
//     VALUES ('Ate', 'Labas')
//     `);
//     await con.end();
//   } else {
//     const [data] = await con.execute(
//       'CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, name TEXT, email TEXT, password TEXT)',
//     );
//     console.log('Created table');
//   }
//   await con.end();
// };

// checkTablesStatus();
