
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Starting email test...');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Explicitly set host
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log('Transporter verification failed!');
        console.error(error);
    } else {
        console.log('Server is ready to take our messages');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email',
            text: 'Test email from debugging script.'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Email sending failed!');
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
});
