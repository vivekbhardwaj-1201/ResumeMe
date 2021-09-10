const jwt = require('jsonwebtoken')

function verifyToken(req,res,next){
    if(!req.headers.authorization){
        return res.status(401).send("Unauthorised Request");
    }
    let token = req.headers.authorization.split(' ')[1]
    if(token=='null'){
        return res.status(401).send('Unauthorized Request');
    }
    let payload = jwt.verify(token,process.env.SECRET_KEY )
    if(!payload){
        return res.status(401).send('Unauthorised Request');
    }
    req.userId = payload.id
    console.log(req.userId)
    next()
}
module.exports = verifyToken;