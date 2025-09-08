

export const validation = (schema) => {
    return(req, res, next) => {

        let validationErrors = []

        for (const key of Object.keys(schema)) {

            const data = schema[key].validate(req[key], { abortEarly: false })
            
            if (data?.error) {
                validationErrors.push(data?.error?.details)
             }            
        }
        if (validationErrors.length) {
             //throw new Error( " validation error ", {cause: 400})
            return res.status(400).json({message: " validation error ", error: validationErrors });
        }
        return next()
    }
}