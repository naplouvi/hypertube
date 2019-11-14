const express = require("express");
const FortyTwo = express.Router();
const User = require("../schemas/User");
const jwt = require('jsonwebtoken')

FortyTwo.post("/login", async (req, res) => {
	let user = await User.findOne({
		email: req.body.data.email,
		authProvider: "42"
	});
	if (user) {
		const payload = {
			check: true,
			userid: user._id
		}

		var token = jwt.sign(payload, process.env.SECRET, {
			expiresIn: "2 days"
		});

		res.status(200).send({
			user: user,
			token: token
		});
	} else {
		res.json({
			message: "You need to register first."
		});
	}
}).post("/register", async (req, res) => {
	users = await User.find({email: req.body.data.email});
	if (users.length > 0) {
		res.json({message: "User exists with this email"});
		return;
	}
	user = new User({
		email: req.body.data.email,
		picture: "img/default.png",
		username: req.body.data.login,
		firstName: req.body.data.first_name,
		lastName: req.body.data.last_name,
		authProvider: "42"
	});
	user
		.save()
		.then(data => {
			res.status(200).json(data);
		})
		.catch(err => {
			res.status(200).json({
				message: err
			});
		});
});

module.exports = FortyTwo;