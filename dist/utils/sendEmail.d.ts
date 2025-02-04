import Mail from "nodemailer/lib/mailer";
declare const sendEmail: (mailOptions: Mail.Options) => Promise<boolean>;
export default sendEmail;
