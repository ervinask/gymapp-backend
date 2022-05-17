const express = require('express');
const Joi = require('joi');
const mysql = require('mysql2/promise');

const { mysqlConfig } = require('../../config');
const isLoggedIn = require('../../middleware/auth');
const { exerciseValidation } = require('../../middleware/validation');

const router = express.Router();

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

router.post('/', exerciseValidation, async (req, res) => {
  if (!req.body.video.startsWith('https://www.youtube.com/watch?v=')) {
    return res.status(400).send({ err: 'Incorrect URL passed' });
  }

  req.body.video = req.body.video.split('?v=').pop();

  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `INSERT INTO exercises (name, description, video)
      VALUES (${mysql.escape(req.body.name)}, 
      ${mysql.escape(req.body.description)},
      ${mysql.escape(req.body.video)}
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
