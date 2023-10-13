const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();
const fileUpload = require('express-fileupload');
const multer = require('multer');
const nodemailer = require('nodemailer')

// router.use(express.json())
// router.use(fileUpload());

const upload = multer();

router.post('/send', upload.single('attachment'), (req, res) => {
    const jsonData = req.body;
    const attachment = req.file;

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password,
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const mailOptions = {
        from: process.env.email, // Sender's email address
        to: jsonData.to, // Recipient's email address
        subject: jsonData.subject,
        text: jsonData.text
    };

    if (attachment) {
        mailOptions.attachments = [
            {
                filename: attachment.originalname,
                content: attachment.buffer,
            }
        ]
    }

    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.send(error)
        } else {
            res.send(info.response)
        }
    })
})

app.use('/.netlify/functions/index', router);
module.exports.handler = serverless(app);
