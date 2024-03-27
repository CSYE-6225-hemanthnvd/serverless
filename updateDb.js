const mysql = require('mysql2/promise');

const updateEmailSentTimestamp = (id,username) => {
  mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
  }).then((conn) => {
    conn.query('UPDATE `users` SET `email_sent` = ? WHERE `id` = ?;', [Date.now(), id])
    console.log(`Timestamp updated for user ${username}}`);
  }).catch((err) => {
    console.log(err);
  });
}
module.exports = updateEmailSentTimestamp;