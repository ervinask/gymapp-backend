const express = require('express');
const Joi = require('joi');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const { mysqlConfig, jwtSecret } = require('../../config');
// const { isLoggedIn } = require('../../middleware');

const router = express.Router();

const setSchema = Joi.object({
  weight: Joi.number().required(),
  reps: Joi.number().required(),
  sets: Joi.number().required(),
  exercise_id: Joi.string().required(),
});

router.get('/', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userDetails = jwt.verify(token, 'ervinasss123');

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

router.post('/', async (req, res) => {
  let setDetails;
  try {
    setDetails = await setSchema.validateAsync(req.body);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect data sent' });
  }

  const token = req.headers.authorization.split(' ')[1];
  const userDetails = jwt.verify(token, jwtSecret);

  try {
    const con = await mysql.createConnection(mysqlConfig);
    console.log(userDetails.accountId);
    const [data] = await con.execute(
      `INSERT INTO sets 
      (weight, reps, sets, user_id, exercise_id) VALUES 
      (${mysql.escape(setDetails.weight)}, 
          ${mysql.escape(setDetails.reps)}, 
          ${mysql.escape(setDetails.sets)},
          ${mysql.escape(userDetails.accountId)},
          ${mysql.escape(setDetails.exercise_id)})`,
    );

    await con.end();
    console.log(data);
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

module.exports = router;
