
import { EventEmitter } from "events"
import { generateToken } from "../token/generateToken.js";
import { sendEmail } from "../../service/sendEmail.js";

export const eventEmitter = new EventEmitter()

eventEmitter.on("sendEmail", async (data) => {
    const { email } = data

    const token = await generateToken({
      payload: { email }, 
      SIGNATURE: process.env.SIGNATURE , 
      options: { expiresIn: 60 * 3 }});
      
    const link = `http://localhost:3000/users/confirmEmail/${token}`

    
    const isSend = await sendEmail({ 
        to: email, 
        subject: "conforim email",
        html: ` <a href='${link}'> confirm email </a> `
    })

    if (!isSend) {
      throw new Error("fail to send email ", {cause: 500}) 
    }
    
})


eventEmitter.on("forgetPassword", async (data) => {
    const { email, otp } = data

    const isSend = await sendEmail({ 
        to: email, 
        subject: "forget password",
        html: ` <h1> otp:${otp} </h1> `
    })

    if (!isSend) {
      throw new Error(" fail to send otp ", {cause: 500}) 
    }
    
})