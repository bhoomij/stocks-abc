const dotenv = require('dotenv');
dotenv.config();
console.log('process.env.EMAIL: ', process.env);

module.exports = {
  fromEmail: process.env.EMAIL,
  toEmail: process.env.TO_EMAIL,
  apiKey: process.env.API_KEY_BREVO
};
