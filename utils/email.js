const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
    pass: process.env.PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: "a78966562@gmail.com",
            to,
            subject,
            text
        });
        console.log("Email sent");
    } catch (err) {
        console.log(err);
          console.log("❌ Email error:", err);
    }
};

module.exports = sendEmail;