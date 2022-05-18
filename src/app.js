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

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});
