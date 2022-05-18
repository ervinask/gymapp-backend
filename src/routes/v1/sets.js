const express = require('express');
const Joi = require('joi');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const { mysqlConfig, jwtSecret } = require('../../config');
const { setsValidation } = require('../../middleware/validation');

const router = express.Router();

router.get('/', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userDetails = jwt.verify(token, jwtSecret);

  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT * FROM sets 
      WHERE user_id = ${userDetails.accountId}`,
    );

    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(data);
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

router.post('/', setsValidation, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userDetails = jwt.verify(token, jwtSecret);

  try {
    const con = await mysql.createConnection(mysqlConfig);
    console.log(userDetails.accountId);
    const [data] = await con.execute(
      `INSERT INTO sets 
      (weight, reps, sets, user_id, exercise_id, time) VALUES 
      (${mysql.escape(req.body.weight)}, 
          ${mysql.escape(req.body.reps)}, 
          ${mysql.escape(req.body.sets)},
          ${mysql.escape(userDetails.accountId)},
          ${mysql.escape(req.body.exercise_id)}, 
          ${mysql.escape(req.body.time)})`,
    );

    await con.end();
    console.log(data);
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

module.exports = router;
