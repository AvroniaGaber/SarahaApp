import { nanoid, customAlphabet } from "nanoid";
import userModel, { userProviders, userRoles } from "../../DB/models/user.model.js";
import { sendEmail } from "../../service/sendEmail.js";
import { generateToken, verifyToken, Encrypt, Decrypt, Hash, Compare , eventEmitter } from "../../utils/index.js";
import revokeTokenModel from "../../DB/models/revoke-token.model.js";

import {OAuth2Client} from 'google-auth-library';
import cloudinary from "../../utils/cloudinary/index.js";

// ================================  SignUp =================================== //
export const signUp = async (req, res, next) => {
  const { name, email, password, phone, gender, age} = req.body

  console.log(req.file);
  const arrPaths = []
  for (const file of req?.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file?.path, {
    folder: "sarahaApp/users/coverImages",
  })
  arrPaths.push({ secure_url, public_id })
}
/*
const { secure_url, public_id } = await cloudinary.uploader.upload(req?.file?.path , {
  folder: "sarahaApp/users/profileImage",
  })
*/
  // ========  check email ================ //
     if (await userModel.findOne({ email })) {
       throw new Error("Email already exists", {cause: 409} ) 
    }
    //  ======== hash password ==========  //
    const hashedPassword = await Hash({plainText: password, SALT_ROUNDS: process.env.SALT_ROUNDS});

    // ====== Encrypt phone =========== //
    let encryptedPhone = await Encrypt({ plainText:phone, SECRET_KEY: process.env.SECRET_KEY } );
    
    // ================================ send  email =================================== //
  // send email //
    eventEmitter.emit("sendEmail", { email })

    const user = await userModel.create({
      name,
      email,  
      password: hashedPassword, 
      phone: encryptedPhone, 
      gender, 
      age,
      coverImages: arrPaths,
      //profileImage: { secure_url, public_id }
    });
    return res.status(201).json({ message: "Created success" , user });
}
 
// ===============================  confirm email =================================== //
export const confirmEmail = async (req, res, next) => {
    const { token } = req.params
    if (!token) {
      throw new Error( " Token not found ", {cause: 404})
    }
    // ===============  verify token ============ //
    const decoded = await verifyToken({ token, SIGNATURE: process.env.SIGNATURE });
    if (!decoded?.email) {
      throw new Error( " InValid Token ", {cause: 404})
    }
    const user = await userModel.findOne({ 
      email: decoded.email,
      confirmed: false, 
    }); 

    if (!user) {
      throw new Error( "User not exist or already confirmed ", {cause: 404})
      }

    user.confirmed = true
    await user.save()

    return res.status(200).json({ message: " confiremed succsess"  });

};

// ================================  SignIn =================================== //
export const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    // ========  check email ================ //
    const user = await userModel.findOne({ email, confirmed: true });
    if (!user) {
       throw new Error(" Email Not Exist or not confirmed ", {cause: 404} ) 
    }

    // ========  Compare Password ================ //
    const match = await Compare({ plainText: password, cipherText: user.password });
    if (!match) {
       throw new Error("Invalid password", {cause: 400} )
    }
    // ======= create Token ============= //
    const access_token = await generateToken({
      payload: { id: user._id , email: email } ,
      SIGNATURE:  user.role == userRoles.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN , 
      options: { expiresIn: 60 * 60, jwtid: nanoid() } 
      })

    const refresh_token = await generateToken({
      payload: { id: user._id , email: email } ,
      SIGNATURE:  user.role == userRoles.user ?  process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN , 
      options:  { expiresIn: "1y", jwtid: nanoid() }
      });

    return res.status(200).json({ message: "signin successful", access_token, refresh_token });

};

// ================================  profile =================================== //
export const profile = async (req, res, next) => {

    // =========== decrypt Phone ============= //
    var phone = await Decrypt({cipherText:req.user.phone, SECRET_KEY: process.env.SECRET_KEY} );
    req.user.phone = phone

    return res.status(200).json({ message: " succsess" , user: req.user });

};

// ================================  logout =================================== //
export const logout = async (req, res, next) => {

  const revokeToken = await revokeTokenModel.create({
    tokenId: req.decoded.jti,
    expireAt: req.decoded.exp
  })
    return res.status(200).json({ message: " succsess logout" , revokeToken });

};

// ================================  refreshToken =================================== //
export const refreshToken = async (req, res, next) => {

   const { authorization } = req.headers

    const [prefix, token] = authorization.split(" ") || []
    if (!prefix || !token) {
      throw new Error("Token Not Exist", {cause: 404} )
    }
    let signature = ""
    if (prefix == process.env.BEARER_USER) {
        signature = process.env.REFRESH_TOKEN_USER
    }else if (prefix == process.env.BEARER_ADMIN) {
        signature = process.env.REFRESH_TOKEN_ADMIN
    }else {
      throw new Error("InValid prefix", {cause: 400} )
    }
    // ===============  verify token ============ //
      const decoded = await verifyToken({ token, SIGNATURE: signature });
      
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

  // ======= create Token ============= //
    const access_token = await generateToken({
      payload: { id: user._id , email: user.email } ,
      SIGNATURE:  user?.role == userRoles.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN , 
      options: { expiresIn: 60 * 60 , jwtid: nanoid() } 
      })

    const refresh_token = await generateToken({
      payload: { id: user._id , email: user.email } ,
      SIGNATURE:  user?.role == userRoles.user ?  process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN , 
      options:  { expiresIn: "1y", jwtid: nanoid() }
      });
    
    return res.status(200).json({ message: " succsess refreshToken" , access_token, refresh_token });

};

// ================================  updatePassword =================================== //
export const updatePassword = async (req, res, next) => {

  const { oldPassword , newPassword } = req.body

  if (!await Compare({ plainText: oldPassword, cipherText: req.user.password })) {
  throw new Error("Invalid oldPassword", {cause: 404});
  }

  //  ======== hash password ==========  //
  const hashedPassword = await Hash({ plainText: newPassword })
  req.user.password = hashedPassword
  await req.user.save()

  await revokeTokenModel.create({
    idToken: req?.decoded?.jti,
    expireAt: req?.decoded?.exp
  })

  return res.status(200).json({ message: " succsess update Password " , user: req.user });

};

// ================================  forgetPassword =================================== //
export const forgetPassword = async (req, res, next) => {

  const { email } = req.body

  // ========  check email ================ //
  const user = await userModel.findOne({ email});
  if (!user) {
    throw new Error(" Email Not Exist ", {cause: 404} ) 
  }
  const otp = customAlphabet("0123456789", 4)()

  // ================================ send  email =================================== //
  eventEmitter.emit("forgetPassword", { email, otp })

  //  ======== hash password ==========  //
  user.otp = await Hash({ plainText: otp })
  await user.save()

  return res.status(200).json({ message: " succsess send email "  });

};

// ================================  resetPassword =================================== //
export const resetPassword = async (req, res, next) => {

  const { email, otp , newPassword } = req.body

  // ========  check email ================ //
  const user = await userModel.findOne({ email, otp: { $exists: true } });
  if (!user) {
    throw new Error(" user Not Exist or invalide otp ", {cause: 404} ) 
  }

  if (!await Compare({ plainText: otp, cipherText: user?.otp })) {
  throw new Error("Invalid otp", {cause: 404});
  }
  //  ======== hash password ==========  //
  const hash = await Hash({ plainText: newPassword })
  await userModel.updateOne(
    { email },
    { password: hash,
    $unset: { otp: ""}
  })

  return res.status(200).json({ message: " succsess reset password "  });

};

// ================================  updateProfile =================================== //
export const updateProfile = async (req, res, next) => {
    const { name, email, phone, gender, age} = req.body

    if (name) req.user.name = name
    if (gender) req.user.gender = gender
    if (age) req.user.age = age

    if (phone) {
      // ====== Encrypt phone =========== //
    var encryptedPhone = await Encrypt({ plainText: phone, SECRET_KEY: process.env.SECRET_KEY } )
    req.user.phone = encryptedPhone
    }

    if (email) {
    // ========  check email ================ //
    const user = await userModel.findOne({ email});
    if (!user) {
      throw new Error(" Email already Exist ", {cause: 404} ) 
    }
    // ================================ send  email =================================== //
    eventEmitter.emit("sendEmail", { email })

    req.user.email = email
    req.user.confirmed = false
  }
  await req.user.save()
  
  return res.status(200).json({ message: " succsess update profile " , user: req.user });

};

// ================================  getprofileData =================================== //
export const getprofileData = async (req, res, next) => {
  const { id } = req.params
  const user = await userModel.findById(id).select("-password -role -confirmed -phone -createdAt -updatedAt");
    if (!user) {
      throw new Error(" user already Exist ", {cause: 404} ) 
    }
    return res.status(200).json({ message: " succsess" , user });

};

// ================================  freezeProfile =================================== //
export const freezeProfile = async (req, res, next) => {
  const { id } = req.params
  if (id && req.user.role !== userRoles.admin) {
    throw new Error(" you can not freeze this account ", {cause: 404} ) 
  }
  const user = await userModel.updateOne(
    {
      _id: id || req.user._id,
      isDeleted: { $exists: false }
    },
    {
      isDeleted: true,
      deletedBy: req.user._id
    },
    {
      $inc:{ __v: 1 }
    }

  )
   user.matchedCount ? 
   res.status(200).json({ message: " succsess to freeze" , user }) : 
   res.status(400).json({ message: " fail to freeze" , user });
};

// ================================  unFreezeProfile =================================== //
export const unFreezeProfile = async (req, res, next) => {
  const { id } = req.params
  if (id && req.user.role !== userRoles.admin) {
    throw new Error(" you can not freeze this account ", {cause: 404} ) 
  }
  const user = await userModel.updateOne(
    {
      _id: id || req.user._id,
      isDeleted: { $exists: true }
    },
    {
      $unset: { isDeleted: "" , deletedBy: ""},
    },
    {
      $inc:{ __v: 1 }
    }

  )
   user.matchedCount ? 
   res.status(200).json({ message: " succsess to UnFreeze" , user }) : 
   res.status(400).json({ message: " user not exist or aleardy restored" , user });
};

// ================================  loginWithGmail =================================== //
export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,  
    });
    const payload = ticket.getPayload();
    return payload
  }
  const { email, email_verified, name, picture } = await verify()

  // ========  check email ================ //
  let user = await userModel.findOne({ email });
  if (!user) {
    user = await userModel.create({
      name,
      email,
      confirmed: email_verified,
      image: picture,
      password: nanoid(),
      provider: userProviders.google
      })
    }
  if (user.provider !== userProviders.google ) {
    throw new Error(" please ligin on system ", {cause: 404} )  
  }

// ======= create Token ============= //
  const access_token = await generateToken({
    payload: { id: user._id , email: email } ,
    SIGNATURE:  user.role == userRoles.user ? process.env.ACCESS_TOKEN_USER : process.env.ACCESS_TOKEN_ADMIN , 
    options: { expiresIn: 60 * 60, jwtid: nanoid() } 
  })
  const refresh_token = await generateToken({
    payload: { id: user._id , email: email } ,
    SIGNATURE:  user.role == userRoles.user ?  process.env.REFRESH_TOKEN_USER : process.env.REFRESH_TOKEN_ADMIN , 
    options:  { expiresIn: "1y", jwtid: nanoid() }
  });
  
  return res.status(200).json({ message: "loginWithGmail successful", access_token, refresh_token });

};

// ================================  updateProfileImage without folder  =================================== //
/*
export const updateProfileImage = async (req, res, next) => {
  const arrPaths = []
  for (const file of req?.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file?.path, {
    folder: "sarahaApp/users/coverImages",
  })
  arrPaths.push({ secure_url, public_id })
}
 
    //const { secure_url, public_id } = await cloudinary.uploader.upload(req?.file?.path, {
   // folder: "sarahaApp/users/profileImage",
  //  });
 
  const user = await userModel.findByIdAndUpdate( req.user._id,  { coverImages: arrPaths } );
  let public_ids = []
  for (const image of user?.coverImages) {
    public_ids.push(image?.public_id)
  }

  await cloudinary.api.delete_resources(public_ids)
  
  return res.status(200).json({ message: " succsess update profile image ", user });
};
*/
// ================================  updateProfileImage with folder and delet  =================================== //
export const updateProfileImage = async (req, res, next) => {
  /*
  const arrPaths = []
  for (const file of req?.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file?.path, {
    folder: "sarahaApp/users/coverImages",
  })
  arrPaths.push({ secure_url, public_id })
}

  const { secure_url, public_id } = await cloudinary.uploader.upload(req?.file?.path, {
    folder: "sarahaApp/users/profileImage",
  });

  const user = await userModel.findByIdAndDelete( req.user._id,  { coverImages: arrPaths } );
  let public_ids = []
  for (const image of user?.coverImages) {
    public_ids.push(image?.public_id)
  }
    */

  await cloudinary.api.delete_resources_by_prefix("sarahaApp/users/coverImages")
  await cloudinary.api.delete_folder("sarahaApp/users/coverImages")


  return res.status(200).json({ message: " succsess update profile image " });
};
