declare const sendEmail: (verificationCode: string, userEmail: string, subject: string, text: string, template?: string) => Promise<boolean>;
export default sendEmail;
