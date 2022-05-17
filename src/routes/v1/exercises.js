const express = require('express');
const Joi = require('joi');
const mysql = require('mysql2/promise');

const { mysqlConfig } = require('../../config');
const isLoggedIn = require('../../middleware/auth');

const router = express.Router();

const exerciseSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  video: Joi.string().trim().required(),
});

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute('SELECT * FROM exercises');

    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(data);
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

router.post('/', async (req, res) => {
  let exerciseDetails;

  try {
    exerciseDetails = await exerciseSchema.validateAsync(req.body);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect data passed' });
  }

  if (!exerciseDetails.video.startsWith('https://www.youtube.com/watch?v=')) {
    return res.status(400).send({ err: 'Incorrect URL passed' });
  }

  exerciseDetails.video = exerciseDetails.video.split('?v=').pop();

  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `INSERT INTO exercises (name, description, video)
      VALUES (${mysql.escape(exerciseDetails.name)}, 
      ${mysql.escape(exerciseDetails.description)},
      ${mysql.escape(exerciseDetails.video)}
      )`,
    );
    await con.end();

    if (!data.insertId || data.affectedRows !== 1) {
      console.log(data);
      return res.status(500).send({ err: 'Server issue occured' });
    }

    return res.send({
      msg: 'Successfully added exercise',
      exerciseId: data.insertId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

module.exports = router;
