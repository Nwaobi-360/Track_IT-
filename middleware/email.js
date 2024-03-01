// const nodemailer = require("nodemailer")
// require("dotenv").config()

// async function sendEmail(options) {
// const transporter = nodemailer.createTransport({

//  service:process.env.service,

//   auth: {
//     user: process.env.user,
//     pass: process.env.emailPassword,
   
//   },
// });
 
//  const mailOption = await transporter.sendMail({
//     from: process.env.user, // sender address
//     to: options.email, // list of receivers
//     subject: options.subject, // Subject line
//     text: options.text, // plain text body
//     html: options.html, // html body
//   });

// await transporter.sendMail(mailOption)
//   // if (error) {
//   //  return res.status(500).json({
//   //   error: 'Error sending verification email' + error.message
//   //  })
//   // }else{
//   //   return res.status(200).json({
//   //     message: 'Verification email sent'
//   //   })
//   // }

// // })
 
// }
// module.exports = {sendEmail}
const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendMail(options) {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.service,
            auth: {
                user: process.env.user, 
                pass: process.env.emailPassword,
            }
        })
            const mailOption = {
              from: process.env.user,
              to: options.email,
              subject: options.subject,
              text: options.text,
              html: options.html
            };
        
            await transporter.sendMail(mailOption);   
            return {
                success: true,
                message: 'Email sent successfully',
            }
    } catch (err) {
        console.error('Error sending mail:', err.message);
        return {
            success: false,
            message: 'Error sending mail: ' + err.message,
        };
    }
}

module.exports = {sendMail}
