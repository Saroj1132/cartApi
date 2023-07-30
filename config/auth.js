const jwt = require("jsonwebtoken")
const User = require("../models/user_Model")

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const data = jwt.verify(token, "Mykey123");
        const user = await User.findOne({_id:data._id});
        if(!user){
            throw new Error()
        }
        req.user = user
        next();
        
    } catch (error) {
        res.status(401).send({error: "Not auth....."})
    }
} 

module.exports = {
    auth
}