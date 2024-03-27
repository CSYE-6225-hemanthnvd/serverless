const { PubSub } = require('@google-cloud/pubsub');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const htmlBuilder = require('./htmlBuilder');
const updateEmailSentTimestamp = require('./updateDb');

const mailgun = new Mailgun(formData);
const pubSubClient = new PubSub();

const listenSubscription = async (subscriptionName, timeout) => {
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
  });
  const subscription = pubSubClient.subscription(subscriptionName);
  const messageHandler = message => {
    const messageData = JSON.parse((new Buffer(message.data)).toString());
    const html = htmlBuilder(messageData.first_name, messageData.last_name, messageData.id)
    mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "Webapp <no-reply@hemanthnvd.com>",
      to: [messageData.username],
      subject: "Email Verification for CSYE 6225 Webapp Account",
      html: html,
    })
      .then((msg) => {
        console.log(msg);
        updateEmailSentTimestamp(messageData.id,messageData.username);
      })
      .catch(err => console.error(err));
    message.ack();
  };
  subscription.on('message', messageHandler);
  setTimeout(() => {
    subscription.removeListener('message', messageHandler);
  }, timeout * 1000);
}

module.exports = listenSubscription;