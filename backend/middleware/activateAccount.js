function activateAccount(req,res,next){
    const {token} =req.body;
    if(token){
        jwt.verify(token,process.env.SECRET_KEY);
        if(err){
            return res.status(400).json({error:'Incorrector Expired Link'})
        }
    
    }else{
        return res.json({error:"Something went wrong!!"})
    }
}