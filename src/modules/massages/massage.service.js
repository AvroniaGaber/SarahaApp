import massageModel from "../../DB/models/massage.model.js";
import userModel from "../../DB/models/user.model.js";

// ================================  createMassage =================================== //
export const createMassage = async (req, res, next) => {
    const { userId, content } = req.body
    // cheack user //
    const userExist = await userModel.findOne({ _id: userId, isDeleted: { $exists: false } })
    if (!userExist) {
       throw new Error(" user Not Exist or frease ", {cause: 404} ) 
    }
    const massage = await massageModel.create({ userId, content })

    return res.status(201).json({ message: "Created massage successfly" , massage });
};

// ================================  listMassages =================================== //
export const listMassages = async (req, res, next) => {

    console.log(req.params);

    const massages = await massageModel.find({ userId: req?.params?.id }).populate([
        {
            path: "userId",
            select: "name"
        }
    ])

    return res.status(200).json({ message: " find all massage successfly " , massages });
};

// ================================  getMassages =================================== //
export const getMassages = async (req, res, next) => {
    const { id } = req.params
    
    const massage = await massageModel.findOne({ userId: req?.user?._id, _id: id })
    if (!massage) {
       throw new Error(" message Not found ", {cause: 404} ) 
    }
    return res.status(200).json({ message: " find massage successfly " , massage });
};
