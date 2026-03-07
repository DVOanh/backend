function authorizeAdmin(req, res, next){
    if(req.user.role !== "admin"){
        return res.status(400).json({message: "Ko co quyen truy cap Admin"});
    }
    next();
}

export default authorizeAdmin;