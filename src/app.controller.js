import checkConnectionDb from "./DB/connectionDB.js"
import { globalErrorHandling } from "./middleware/globalErrorHandling.js"
import massageRouter from "./modules/massages/massage.controller.js"
import userRouter from "./modules/users/user.controller.js"
import cors from "cors"
import morgan from "morgan"
import { rateLimit } from 'express-rate-limit'
import helmet from "helmet";

var whitelist = [process.env.FRONT_ORIGIN, undefined]
    var corsOptions = {
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        }
    }

const bootstrap = (app, express) => {

    const limiter = rateLimit({
        windowMs: 60*1000,
        max: 5,
        /*
        message: {
            error: "Too many requests, please try again later."
        },
        statusCode: 400,
        */
        handler:(req,res,next,options)=>{
            res.status(400).json({
                error: "Game Over"
            })
        },
       // legacyHeaders: false
       // skipSuccessfulRequests: true,
       // skipFailedRequests: true
    })


    app.use(cors(corsOptions))

    app.use(morgan("short"))

    app.use(limiter)

    app.use(helmet())

    app.use(express.json())

    app.get("/",(req,res) => res.status(200).json({message: " welcom on my app "}))

    checkConnectionDb()

    app.use("/uploads", express.static("uploads"))

    app.use("/users", userRouter)

    app.use("/massages", massageRouter)

    app.use("{/*demo}", (req, res, next) => {
        throw new Error(`404 URL not found ${req.originalUrl}` , {cause: 404} )
    })

    app.use(globalErrorHandling)

}

export default bootstrap