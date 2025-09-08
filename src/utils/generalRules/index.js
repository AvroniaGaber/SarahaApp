import Joi from "joi"
import { Types } from "mongoose"

export const customId = (value, helper) => {
    const data = Types.ObjectId.isValid(value)
    return data ? value : helper.message("InValid Id ")
}

export const generalRules = {
    id: Joi.string().custom(customId),
    email: Joi.string().email({ tlds: { allow: true } , minDomainSegments: 2 }),
    password: Joi.string().required(),
    headers: Joi.object({
        authorization: Joi.string().required(),
        host: Joi.string(),
        "accept-encoding": Joi.string(),
        "content-type": Joi.string(),
        "content-length": Joi.string(),
        "connection": Joi.string(),
        "user-agent": Joi.string(),
        "accept": Joi.string(),
        "cache-control": Joi.string(),
        "postman-token": Joi.string(),
    }),
    file: Joi.object({
        size: Joi.number().positive().required(),
        path: Joi.string().required(),
        filename: Joi.string().required(),
        destination: Joi.string().required(),
        mimetype: Joi.string().required(),
        encoding: Joi.string().required(),
        originalname: Joi.string().required(),
        fieldname: Joi.string().required(),
    }).messages({
        "any.required": "file is required"
    })
}

