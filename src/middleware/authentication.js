 
import userModel from "../DB/models/user.model.js";
import { verifyToken } from "../utils/token/verifyToken.js";
import revokeTokenModel from "../DB/models/revoke-token.model.js";

export const authentication =  async (req, res, next) => {
    const { authorization } = req.headers

    const [prefix, token] = authorization.split(" ") || []
    if (!prefix || !token) {
      throw new Error("Token Not Exist", {cause: 404} )
    }
    let signature = ""
    if (prefix == "bearer") {
        signature = process.env.ACCESS_TOKEN_USER
    }else if (prefix == "admin") {
        signature = process.env.ACCESS_TOKEN_ADMIN
    }else {
      throw new Error("InValid prefix", {cause: 400} )
    }
    // ===============  verify token ============ //
      const decoded = await verifyToken({ token, SIGNATURE: signature });
       if (!decoded?.email) {
      throw new Error(" InValid Token ", {cause: 400} )
    }

    // ============ check  revoketoken ============== //
     const revoked = await revokeTokenModel.findOne({ tokenId: decoded.jti}); 
     if (revoked) {
      throw new Error("please log in again ", {cause: 400} )
    }

    // ============ check  user exist ============== //
     const user = await userModel.findOne({ email: decoded.email }); 
     if (!user) {
      throw new Error("User not exist", {cause: 404} )
    }
    
    // ============ check  email  ============== //
     if (!user?.confirmed || user?.isDeleted == false) {
      throw new Error(" please confirm email or you are freezed ", {cause: 400} )
    }
    req.user = user; 
    req.decoded = decoded

    return next()
}
