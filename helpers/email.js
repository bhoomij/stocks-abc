const SibApiV3Sdk = require('sib-api-v3-sdk');
const { isRecentAlert } = require('./time');

// Set Sendinblue API key
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY_BREVO; // Replace with your Sendinblue API key

const RECENT_ALERT_COLOR = '#ccffcc'

async function sendEmail(alerts, symbol, fromEmail, toEmail, title) {
  const reversed = alerts.reverse()
  const alertDetails = reversed.map(alert => {
    // Check if the alert is recent (less than 24 hours old)
    const isRecent = isRecentAlert(alert.date);
    // Define CSS class based on whether the alert is recent or not
    const rowClass = isRecent ? 'recent-alert' : '';
    return `<tr class="${rowClass}">
      <td>${alert.date.toISOString().split('T')[0]}</td>
      <td>${alert.close.toFixed(2)}</td>
      <td>${alert.rsi.toFixed(2)}</td>
      <td>${alert.sma}</td>
      <td>${alert.smaQuarterly}</td>
      <td>${alert.smaYearly}</td>
    </tr>`;
  }).join('');

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = `${title} Alert for ${symbol}`;
  sendSmtpEmail.htmlContent = `<html>
    <head>
      <style>
        .recent-alert {
          background-color: ${RECENT_ALERT_COLOR}; /* Change to your desired highlight color */
        }
      </style>
    </head>
    <body>
      <p>${title} alerts for <b>${symbol}</b>:</p>
      <br/>
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <th>Date</th>
          <th>Close</th>
          <th>RSI</th>
          <th>SMA 20</th>
          <th>SMA 50</th>
          <th>SMA 200</th>
        </thead>
        <tbody>
          ${alertDetails}
        </tbody>
      </table>
    </body>
  </html>`;
  sendSmtpEmail.sender = { name: 'Stock Alerts App', email: fromEmail };
  sendSmtpEmail.to = [{ email: toEmail, name: 'User' }];

  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  sendEmail,
}
