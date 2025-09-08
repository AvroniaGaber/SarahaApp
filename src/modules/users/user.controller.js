
import { Router } from "express";
import * as UC from "./user.service.js";
import { authentication } from "../../middleware/authentication.js";
import { validation } from "../../middleware/validation.js";
import * as UV from "./user.validation.js";
import { userRoles } from "../../DB/models/user.model.js";
import { authorization } from "../../middleware/authorization.js";
import { allowedExtensions, MulterHost } from "../../middleware/Multer.js";
import massageRouter from "../massages/massage.controller.js";

const userRouter = Router({
    caseSensitive: true,
    strict: true,
    mergeParams: false
})

userRouter.use("/:id/massages", massageRouter)

userRouter.post("/signup",
     MulterHost({ 
    customPath: "users",
    customExtensions: [...allowedExtensions.document, ...allowedExtensions.image, ...allowedExtensions.pdf, ...allowedExtensions.video] 
}).array("attachments"),
 validation(UV.signUpSchema), UC.signUp);


userRouter.get("/confirmEmail/:token",  UC.confirmEmail);
userRouter.post("/signin", validation(UV.signInSchema), UC.signIn);
userRouter.get("/profile", authentication, authorization( Object.values(userRoles) ), UC.profile);
userRouter.post("/logout", authentication, UC.logout);
userRouter.post("/refreshToken", UC.refreshToken);
userRouter.patch("/updatePassword", validation(UV.updatePasswordSchema), authentication, UC.updatePassword);
userRouter.patch("/forgetPassword", validation(UV.forgetPasswordSchema), UC.forgetPassword);
userRouter.patch("/resetPassword", validation(UV.resetPasswordSchema), UC.resetPassword);
userRouter.patch("/updateProfile", validation(UV.updateProfileSchema), authentication, UC.updateProfile);
userRouter.get("/getprofileData/:id", UC.getprofileData);
userRouter.delete("/freezeProfile/{:id}", validation(UV.freezeProfileSchema), authentication, UC.freezeProfile);
userRouter.delete("/unFreezeProfile/{:id}", validation(UV.unFreezeProfileSchema), authentication, UC.unFreezeProfile);
userRouter.post("/loginWithGmail", UC.loginWithGmail);

userRouter.patch("/updateProfileImage", 
    authentication,
    MulterHost({ 
    customExtensions: allowedExtensions.image
}).array("attachments"),
validation(UV.updateProfileImageSchema), 
UC.updateProfileImage);





export default userRouter