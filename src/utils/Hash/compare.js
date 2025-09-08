


 import bcrypt from "bcrypt";
 
 export const Compare = async ({ plainText , cipherText } = {}) => {
     return  bcrypt.compareSync(plainText, cipherText);
 }
 