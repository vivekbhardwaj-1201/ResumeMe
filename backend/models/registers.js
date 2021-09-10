const mongoose = require("mongoose");
const resumeSchema = mongoose.Schema({
	userId:{
		type:mongoose.Schema.Types.ObjectId,
		required:true,
		ref:"Member"
	},
	username:{
		type:String,
		unique:true,
	},
	profilePic:{
		type:String
	},
	firstname: {
		type: String,
	},
	lastname: {
		type: String,
	},
	email: {
		type: String,
	},
	phone: {
		type: Number,
	},
	profession: {
		type: String,
	},
	address: {
		type: String,
	},
	intro: {
		type: String,
	},
	skill: {type: String,
	},
	education: [
		{   _id:false,
			school: {
				type: String,
			},
			
			year: {
				type: Number,
			},
			degree: {
				type: String,
			},
			
		},
	],
	projects: [
		{   _id:false,
			title: {
				type: String,
			},
			description: {
				type: String,
			},
		},
	],
	certifications:[
		{   _id:false,
			cerT:{
				type:String,
			},
			desc:{
				type:String,
			},
		},
	],
});

const Resume = new mongoose.model("resume", resumeSchema);
module.exports = Resume;