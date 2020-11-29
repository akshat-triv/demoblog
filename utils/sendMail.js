const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class sendEmail {
  constructor(to, subject, message, link) {
    this.to = to.email;
    this.firstName = to.name.split(' ')[0];
    this.subject = subject;
    this.message = message;
    this.link = link;
    this.from = 'Akshat Trivedi';
  }

  createTransporter() {
    let transport;
    if (process.env.NODE_ENV === 'development') {
      transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
    } else {
      transport = nodemailer.createTransport({
        service: 'Google',
        auth: {
          user: '',
          pass: '',
        },
      });
    }
    return transport;
  }

  createMail() {
    const mail = {
      to: this.to,
      from: this.from,
      subject: this.subject,
      text: this.message,
    };

    return mail;
  }

  async send(template) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.link,
        subject: this.subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: this.subject,
      html,
      text: htmlToText.fromString(html),
      //html: ------
    };

    this.createTransporter().sendMail(mailOptions);
  }
  async welcome() {
    await this.send('welcome');
  }
  async forgotPassword() {
    await this.send('forgotPass');
  }
}

module.exports = sendEmail;
