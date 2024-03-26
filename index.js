const functions = require('@google-cloud/functions-framework');
const { PubSub } = require('@google-cloud/pubsub');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mysql = require('mysql2/promise');

const mailgun = new Mailgun(formData);
const pubSubClient = new PubSub();

functions.cloudEvent('sendEmailFunction', sendEmail => {
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
  });
  const listenWithCustomAttributes = async (subscriptionName, timeout) => {
    const subscription = pubSubClient.subscription(subscriptionName);
    const messageHandler = message => {
      const messageData = JSON.parse((new Buffer(message.data)).toString());
      mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: "Webapp <no-reply@hemanthnvd.com>",
        to: [messageData.username],
        subject: "Email Verification for CSYE 6225 Webapp Account",
        html: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <div class="outer_container" style="width:100%!important;margin:0;padding:0;">
    <center>
      <table cellspacing="0" cellpadding="8" border="0"
        style="width:100%!important;background:#ffffff;margin:0;padding:0">
        <tbody>
          <tr>
            <td valign="top">
              <table cellspacing="0" cellpadding="0" border="0" align="center" style="border:1px solid #34AADF;">
                <tbody>
                  <tr>
                    <td colspan="2"><img src="https://cdn.iconscout.com/icon/free/png-512/free-verify-email-1578877-1346696.png?f=webp&w=256"
                        style="vertical-align:middle;" /></td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top:1px solid #ccc;">
                      <table cellspacing="0" cellpadding="0" border="0" align="center"
                        style="border-radius:0px 0px 4px 4px">
                        <tbody>
                          <tr>
                            <td height="36" colspan="3"></td>
                          </tr>
                          <tr>
                            <td width="36"></td>
                            <td width="454" valign="top" align="left"
                              style="font-size:14px;color:#444444;font-family:Arial,Verdana,Tahoma;border-collapse:collapse">

                              Hi ${messageData.first_name} ${messageData.last_name},<br /><br />
                              Thanks for signing up on Webapp!<br /><br />
                              To complete your registration, please verify your email address by clicking on the link
                              below:<br /><br />
                              <div>
                                <center><a target="_blank"
                                    href="http://hemanthnvd.com:8080/v1/user/verify?id=${messageData.id}"
                                    style="font-size:16px;color:white;border-top:1px #0075cb solid;width:280px;border-left:1px #0075cb solid;font-weight:600;background-color:#0075cb;border-radius:3px;border-right:1px #0075cb solid;border-bottom:1px #0075cb solid;padding:14px 7px 14px 7px;max-width:280px;font-family:arial,verdana,tahoma,sans-serif;text-align:center;text-decoration:none;margin:0px auto 0px auto;display:block">Verify
                                    Account</a></center>
                              </div><br />
                              If the above link doesn't work, please copy and paste the following link into your browser
                              address bar:<br /><br />
                              <div style="max-width: 450px; word-wrap: break-word;">
                                http://hemanthnvd.com:8080/v1/user/verify?id=${messageData.id}
                              </div><br />
                              NOTE: This link will expire after 2 minutes.<br /><br />
                              If this account was not created by you, please don't click on the above link and contact
                              us at hemanthnvd@gmail.com<br /><br />
                              In case of any issue, please reach out to us at hemanthnvd@gmail.com<br /><br />
                              Thanks,<br />Webapp Team<br /><br />
                            </td>
                            <td width="36"></td>
                          </tr>
                          <tr>
                            <td height="36" colspan="3"></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table cellspacing="0" cellpadding="0" border="0" align="center">
                <tbody>
                  <tr>
                    <td height="10"></td>
                  </tr>
                  <tr>
                    <td style="padding:0;border-collapse:collapse"></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </center>
  </div>
</body>
</html>`,
      })
        .then((msg) => {
          console.log(msg);
          mysql.createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
          }).then((conn) => {
            conn.query(`UPDATE users
            SET email_sent = ${Date.now()}
            WHERE id = ${messageData.id};`)
            console.log("Database updated");
          }).catch((err) => {
            console.log(err);
          });
        })
        .catch(err => console.error(err));
      message.ack();
    };
    subscription.on('message', messageHandler);
    setTimeout(() => {
      subscription.removeListener('message', messageHandler);
    }, timeout * 1000);
  }
  listenWithCustomAttributes("verify_email_sub", 60);
});