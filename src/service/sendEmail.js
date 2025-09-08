 import nodemailer from "nodemailer" ;

// ================================  confearim email =================================== //
export const sendEmail = async({ to, subject, html, attachments }) => {

    const transporter = nodemailer.createTransport({
        port: 465,
        secure: true, 
        service: "gmail",
        auth: {
             user: process.env.EMAIL,
             pass: process.env.PASSWORD,
            },
        tls: {
            rejectUnauthorized: false 
            }
        });

  const info = await transporter.sendMail({
    from: `"vero" <${ process.env.EMAIL }>`,
    to: to || process.env.TEST_EMAIL,
    subject: subject || "Hello ✔",
    html: html || "<b>Hello world?</b>", 
    attachments: attachments || [ ]
  });

  if(info.accepted.length > 0) {
     return true
  }else {
    return false
  }
   
}