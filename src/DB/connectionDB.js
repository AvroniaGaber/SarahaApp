
import mongoose from "mongoose";
import chalk from 'chalk';

const checkConnectionDb = async () => {
    await mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log(chalk.bgGreen("Success to connect DB"));
        
    })
    .catch((error) => {
        console.log(chalk.bgRed("Failed to connect DB"), error);
    })
}

export default checkConnectionDb