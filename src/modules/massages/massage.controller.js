
import { Router } from "express";
import * as MS from "./massage.service.js";
import * as MV from "./massage.validations.js";
import { validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";

const massageRouter = Router({
    caseSensitive: true,
    strict: true,
    mergeParams: true 
})


massageRouter.post("/createMassage",validation(MV.createMassageSchmea), MS.createMassage)
massageRouter.get("/listMassages", authentication, MS.listMassages)
massageRouter.get("/getMassages/:id", validation(MV.getMassagesSchmea), authentication, MS.getMassages)



export default massageRouter