const nodemailer = require('nodemailer');
const config = require('config');

async function sendEmail(toAdress, subject, text, html) {
    //let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        service: config.get('nodeMailer.transport.service'),
        //host: 'smtp.gmail.com',
        auth: {
            user: config.get('nodeMailer.transport.user'), // generated ethereal user
            pass: config.get('nodeMailer.transport.pass'), // generated ethereal password
        },
    });

    let info = await transporter.sendMail({
        from: config.get('nodeMailer.info.from'), // sender address
        to: toAdress, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        //html: html, // html body
    });
    return info.messageId;
}

module.exports = sendEmail;