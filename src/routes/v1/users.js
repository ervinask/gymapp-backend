const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { mysqlConfig, jwtSecret } = require('../../config');
const { registrationValidation, loginValidation, changePasswordValidation } = require('../../middleware/validation');
const isLoggedIn = require('../../middleware/auth');

const router = express.Router();

router.post('/register', registrationValidation, async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);

    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `INSERT INTO users (email, name, password) 
      VALUES (${mysql.escape(req.body.email)}, 
      ${mysql.escape(req.body.name)}, 
      '${hash}'
      )`,
    );
    await con.end();

    if (!data.insertId || data.affectedRows !== 1) {
      console.log(data);
      return res.status(500).send({ err: 'Server issue occured' });
    }

    return res.send({
      msg: 'Successfully created an account ',
      accountId: data.insertId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT id, email, password, name
      FROM users 
      WHERE email = ${mysql.escape(req.body.email)} LIMIT 1`);
    await con.end();

    if (data.length === 0) {
      return res.status(404).send({ err: 'User not found' });
    }

    if (!bcrypt.compareSync(req.body.password, data[0].password)) {
      return res.status(404).send({ err: 'Incorrect password' });
    }

    const token = jwt.sign({ accountId: data[0].id }, jwtSecret);
    console.log(token);
    const name = data[0].name;

    return res.send({
      msg: 'User successfully logged in',
      name: name,
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'A server issue occured' });
  }
});

router.post('/change-password', changePasswordValidation, isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT id, email, password 
      FROM users 
      WHERE id = ${mysql.escape(req.user.accountId)} LIMIT 1`,
    );

    console.log(data);
    const chechHash = bcrypt.compareSync(req.body.oldPassword, data[0].password);

    if (!chechHash) {
      await con.end();
      return res.status(400).send({ err: 'Incorrect old password' });
    }

    const newPasswordHash = bcrypt.hashSync(req.body.newPassword, 10);

    const changePassDBRes = await con.execute(
      `UPDATE users SET password=${mysql.escape(newPasswordHash)} WHERE id=${mysql.escape(req.user.accountId)}`,
    );

    await con.end();
    return res.send({ msg: 'Password changed' });
  } catch (err) {
    return res.status(500).send({ err: 'something wrong with server, please try again later' });
  }
});

module.exports = router;
