import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    service: "Gmail",
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});
const sendEmail = async (mailOptions) => {
    try {
        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(info);
                }
            });
        });
        return true;
    }
    catch (error) {
        return false;
    }
};
export default sendEmail;
