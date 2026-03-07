import jwt from "jsonwebtoken";

function authenticateToken(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({message: 'Chua dang nhap'});
    }
    try{
        const token = authHeader.split(" ") [1];
        const decoded = jwt.verify(token, "SECRE_KEY");
        req.user = decoded;
        next();
    }
    catch(error){
        return res.status(403).json({message: "Token ko hop le"});
    }
}

export default authenticateToken;