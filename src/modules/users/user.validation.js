
import joi from "joi"
import { userGender } from "../../DB/models/user.model.js"
import { generalRules } from "../../utils/generalRules/index.js"



export const signUpSchema = {
body: joi.object({
    name: joi.string().alphanum().min(3).required().messages({
        "any.required": "name is required",
         "string.min": "must be more than 3 laters"
    }),
    email: generalRules.email.required(),
    password: generalRules.password,
    cPassword: joi.string().valid(joi.ref("password")).required(),
    gender: joi.string().valid(userGender.male, userGender.female).required(),
    phone: joi.string().required(),
    age: joi.number().min(18).max(60).required(),
  
}).required(),
files: joi.array().items(generalRules.file.required()).required()
/*
files: joi.object({
  attachment: joi.array().items(generalRules.file.required()).required(),
  attachments: joi.array().items(generalRules.file.required()).required()
}).required()
*/
//file: generalRules.file.required()

//headers: generalRules.headers.required()
}

export const signInSchema = {
body: joi.object({
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    
}).required(),
//headers: generalRules.headers.required()
}

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalRules.password.required(),
    newPassword: generalRules.password.required(),
    cPassword: joi.string().valid(joi.ref("newPassword")).required(),
  }).required(),
  //headers: generalRules.headers.required()
};

export const forgetPasswordSchema = {
  body: joi.object({
    email: generalRules.email.required(),
  }).required(),
  //headers: generalRules.headers.required()
};

export const resetPasswordSchema = {
  body: joi.object({
    email: generalRules.email.required(),
    otp: joi.string().length(4).required(),
    newPassword: generalRules.password.required(),
    cPassword: joi.string().valid(joi.ref("newPassword")).required()
  }).required(),
  //headers: generalRules.headers.required()
};

export const updateProfileSchema = {
body: joi.object({
    name: joi.string().alphanum().min(3),
    email: generalRules.email,
    gender: joi.string().valid(userGender.male, userGender.female),
    phone: joi.string(),
    age: joi.number().min(18).max(60),
  
}),

//headers: generalRules.headers.required()

}

export const freezeProfileSchema = {
params: joi.object({
    id: generalRules.id,
}),

//headers: generalRules.headers.required()

}

export const unFreezeProfileSchema = {
params: joi.object({
    id: generalRules.id,
}),

//headers: generalRules.headers.required()

}

export const updateProfileImageSchema = {
  files: joi.array().items(generalRules.file.required()).required()
  //file: generalRules.file.required()
//headers: generalRules.headers.required()
}
