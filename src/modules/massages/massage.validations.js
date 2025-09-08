import Joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";

export const createMassageSchmea = {
    body: Joi.object({
        userId: generalRules.id.required(),
        content: Joi.string().min(1).required(),
        
}).required(),
//headers: generalRules.headers.required()
}
 
export const getMassagesSchmea = {
    params: Joi.object({
        id: generalRules.id.required()
        
}).required(),
//headers: generalRules.headers.required()
}
 

