const nodemailer = require('nodemailer')

const sendMail = async (options) => {
    // create a transporter 
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, 
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL.USERNAME,
            pass: process.env.EMAIL.PASSWORD,
        }
    });

    const mailOptions = {
         from: 'Joel <hello@google.com>',
         to: options.email,
         subject: options.subject,
         text: options.message,
    }
    await transporter.sendMail(mailOptions)
}

module.exports = sendMail;