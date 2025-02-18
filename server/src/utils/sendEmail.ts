import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// async..await is not allowed in global scope, must use a wrapper
export const sendEMail = async (to: string, html: string, subject: string) => {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: "Blue Page 👻 - mooongjbdev@gmail.com", // sender address
    to: to, // [... , ....]
    subject: subject,
    html: html, // html body
  });

  console.log("Message sent: %s", info.messageId);
};
