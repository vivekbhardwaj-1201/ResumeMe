var express = require("express");
var router = express.Router();
const Resume = require("../models/registers");
const Register = require('../models/members');
const bcrypt =require("bcryptjs");
const jwt = require('jsonwebtoken');
let auth = require('../middleware/auth');
let multer = require('multer');
const Member = require("../models/members");
const PATH = '../uploads';
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox76aa35f6de60457c876e2873642bafdd.mailgun.org';
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (_req, file, cb) => {
    cb(null, file.originalname + '-' + Date.now())
  }
});
const fileFilter =(_req,file,callBack)=>{
	if(file.mimetype==='image/jpeg'||file.mimetype==='image/jpg'||file.mimetype==='image/png'){
		callBack(null,true);
	}else{
		callBack(null,false);
	}
}
const upload = multer({
	storage:storage,
	fileFilter:fileFilter
}).single('image')

router.post('/upload',(req, res)=> {
	if(req.file!=null){
	console.log(req.file);
	upload(req,res,function(err){   
		console.log(req.file);
		if(err){
		  res.json({success:false,message:err});
		}
		else{
		  res.json({success:true,message:"Photo was updated !"});
		} 
	});
}
});
/*GET users listing.*/
router.post("/inputform",auth,async (req, res) => {
	try{
		console.log(req.file)
		let resume = new Resume({
			userId:req.userId,
			username:req.body.username,
			firstname:req.body.firstname,
			lastname:req.body.lastname,
			email:req.body.email,
			phone:req.body.phone,
			profession:req.body.profession,
			address:req.body.address,
			intro:req.body.intro,
			skill:req.body.skill,
			education:req.body.education,
			projects:req.body.projects,
			certifications:req.body.certifications,			
		});		
		const data = await resume.save();
		res.status(201).json({ message: "Resume created Successfully" });
	}catch (error) {
		console.log(req.body);
		res.status(404).json({ "error message :": `Error Occured biro ${error}` });
		console.log(error);
		}	
});
router.post('/register', async function(req, res) {
	try{
		//Updating values to the database
		console.log(req.body)
		let registerUser=new Register(req.body);
		const token = await registerUser.generateAuthToken();
		const data = {
			from: 'vivek.11804848@gmail.com',
			to: req.body.email,
			subject: 'Account Activation Link',
			html:`
				<h2> Please click on the link below to activate your account </h2>
				<a href="#">${process.env.CLIENT_URL}/users/register/${token}</a>
			`
		};
		
		// mg.messages().send(data, function (error, body) {
		// 	if(error){
		// 		console.log(error);
		// 	}
		// 	return res.json({message:'Email has been sent, Kindly activate your account'});
		// 	console.log(body);});
		res.cookie("jwt",token,{
			// expires:new Date(Date.now() + 900000),//token expires every 15 mins from cookies
			httpOnly:true
		});
	    // const userData = await registerUser.save();
		
	res.status(201).json(token);
  	}catch(err){
	  res.status(400).json(`Error is : ${err}`)
    }
});
router.post("/login",async (req,res)=>{
	try{
		console.log(req.body);
		const username=req.body.username;
		const password=req.body.password;
		const user = await Register.findOne({username:username});
		const Match = await bcrypt.compare(password,user.password);
		console.log(Match);
		const token = await user.generateAuthToken(); //Generating tokens every time user login
		// res.cookie("jwt",token,{
		// 	expires:new Date(Date.now() + 900000),
		// 	httpOnly:true
		// });
		const info = user._id;
		if(Match){
			res.status(201).json(token);
			return true;
		}
		else{
			res.status(404).json("Username or password incorrect");
			return false;
		}
	}catch(err){
		res.status(400).json(`User dose not exist`);
	}
  })

router.get("/search/:username",auth,async(req,res)=>{
	try{
		const username = req.params.username;
		console.log(`Bhau ka username ${username}`);
		// const data = await Resume.findOne({username:req.params.username});
		const data = await Resume.find({username:username});
		console.log(`Bhau ka data ${data}`);
		if(data!=null || JSON.stringify(req.userId)=== JSON.stringify(data._id)){
		res.status(201).json(data);
		}else{
			res.status(404).json("Sorry no data Found")
		}
	}catch(error){
		res.status(404).json({"error message ":"Error Occured"})
	}
})
router.get("/searchProfile",auth,async(req,res)=>{
	try{
		const data = await Member.findOne({_id:req.userId});
		console.log(data)
		if(data!=null || JSON.stringify(req.userId)=== JSON.stringify(data._id)){
			console.log("aara hu mai yhn")
		res.status(201).json(data);
		}else{
			res.status(404).json("Sorry no data Found")
		}
	}catch(error){
		res.status(404).json({"error message ":"Error Occured"})
	}
})
router.get("/searchUser",auth,async(req,res)=>{
	try{
		const data = await Resume.findOne({userId: req.userId});
		if(data!=null || JSON.stringify(req.userId)=== JSON.stringify(data._id)){
		res.status(201).json(data);
		}else{
			res.status(404).json("Sorry no data Found")
		}
	}catch(error){
		res.status(404).json({"error message ":"Error Occured"})
	}	
})
router.post("/updateProfile",auth,async (req,res)=>{
	try{
		const data = await Member.findOne({_id:req.userId});
		const first = data.firstname;
        const last = data.lastname;
        const phon = data.phone;
        const Email = data.email;
		if(req.body.firstname!=""&&req.body.phone!=null){
        await Member.updateOne({firstname:first},{$set:{firstname:req.body.firstname}});
		}
		if(req.body.lastname!=""&&req.body.phone!=null){
        await Member.updateOne({lastname:last},{$set:{lastname:req.body.lastname}});
		}
		if(req.body.email!=""&&req.body.phone!=null){
			await Member.updateOne({email:Email},{$set:{email:req.body.email}});
			}
		if(req.body.phone!==""&&req.body.phone!=null){
        await Member.updateOne({phone:phon},{$set:{phone:req.body.phone}});
		}
        res.status(200).json("Updated Successfully");
    }catch(err){
        res.status(400).send(`Error Occured ${err}`);
    }
})
router.put("/updateResume",auth,async (req,res)=>{
	try{
		const data= await Resume.findOneAndUpdate({userId:req.userId},{$set:{
			username:req.body.username,
			firstname:req.body.firstname,
			lastname:req.body.lastname,
			profession:req.body.profession,
			skill:req.body.skill,
			email:req.body.email,
			phone:req.body.phone,
			intro:req.body.intro,
			address:req.body.address,
			education:req.body.education,
			projects:req.body.projects, 
			certifications:req.body.certifications,			
		}});
		res.status(201).json(data);
    }catch(err){
        res.status(400).send(`Error Occured ${err}`);
    }
})
router.get("/resume/:username", auth, async (req, res) => {
	try {
		data = await Resume.findOne({ username: req.params.username });
		if (JSON.stringify(data.userId) === JSON.stringify(req.userId)) {
			res.status(201).json(data);
		} else {
			res.status(401).json("Not authorised to access resume!!");
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

module.exports = router;