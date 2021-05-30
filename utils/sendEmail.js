const nodemailer = require('nodemailer');

const sendEmail = async options => {

    var transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "c3d67a58df4f43",
          pass: "9f6ec92b79224d"
        }
      });

      const message = {
          from: 'noreply@noreply.com',
          to: options.email,
          subject: options.subject,
          text: options.message
      }

      await transporter.sendMail(message)

}

module.exports = sendEmail;