import multer from "multer"
import fs from "fs"

export const allowedExtensions = {
  image: ["image/jpeg", "image/png", "image/gif"],
  video: ["video/mp4"],
  document: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  pdf: ["application/vnd.openxmlformats-officedocument.wordprocessingml.presentation"]
}

export const MulterLocal = ({ customPath = "Generals", customExtensions = [] } = {}) => {

    const fullPath = `uploads/${customPath}`
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, fullPath)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + "__" + file.originalname )
        }
    })

    function fileFilter (req, file, cb) {
        if (!customExtensions.includes(file.mimetype) ) {
             cb(new Error('InValid File'))   
        }else{
            cb(null, true)
        }
    } 
    
    const upload = multer({ storage , fileFilter })
    return upload
}

export const MulterHost = ({ customExtensions = [] } = {}) => {

    const storage = multer.diskStorage({
        /*
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + "__" + file.originalname )
        }
        */
    })

    function fileFilter (req, file, cb) {
        if (!customExtensions.includes(file.mimetype) ) {
             cb(new Error('InValid File'))   
        }else{
            cb(null, true)
        }
    } 
    
    const upload = multer({ storage , fileFilter })
    return upload
}





