
import bcrypt from "bcrypt";

export const Hash = async ({ plainText , SALT_ROUNDS = process.env.SALT_ROUNDS } = {}) => {
    return bcrypt.hashSync(plainText, +SALT_ROUNDS);
}
