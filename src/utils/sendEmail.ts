import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "dan.mayert@ethereal.email",
    pass: "erRU9g5Fju2q4pzSSr",
  },
});

const sendEmail = async (mailOptions: Mail.Options): Promise<boolean> => {
  try {
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });

    return true;
  } catch (error) {
    console.log("Error message:", error);
    return false;
  }
};

export default sendEmail;
