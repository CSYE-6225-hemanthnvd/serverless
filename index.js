const functions = require('@google-cloud/functions-framework');
const listenSubscription = require('./listenSubscription');

functions.cloudEvent('sendEmailFunction', sendEmail => {
  listenSubscription("verify_email_sub", 60);
});