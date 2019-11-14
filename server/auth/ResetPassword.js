const express = require("express");
const resetPassword = express.Router();
const User = require("../schemas/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

resetPassword.post("/", async (req, res) => {
  if (req.body.email) {
    User.findOne(
      {
        email: req.body.email,
        authProvider: "local"
      },
      (err, user) => {
        if (!user) {
          res.status(200).json({
            message: "No user found with this email."
          });
        } else {
          var token = crypto.randomBytes(64).toString("hex");
          var expiration = Date.now() + 3600000;
          user.resetPasswordToken = token;
          user.resetPasswordExpires = expiration;

          user.save(err => {
            if (err) res.json({ message: err });
            else {
              var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "mexicainssouspayes@gmail.com",
                  pass: process.env.GMAIL_PASSWORD
                }
              });

              var mailOptions = {
                from: "hypertube@le-101.fr",
                to: user.email,
                subject: "Reset password request",
                text:
                  "You just requested a password reset.Go to : http://localhost:8080/forgotPassword?token=" +
                  token
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                  res.json({ message: "Internal error, please try again." });
                } else {
                  console.log("Email sent: " + info.response);
                }
              });
              res.status(200).send();
            }
          });
        }
      }
    );
  } else if (
    req.body.token &&
    req.body.newpassword &&
    req.body.passwordconfirm
  ) {
    user = await User.findOne({
      authProvider: "local",
      resetPasswordToken: req.body.token
    });
    if (user) {
      console.log(user.resetPasswordExpires, Date.now());
      if (req.body.newpassword == req.body.passwordconfirm) {
        user.password = bcrypt.hashSync(req.body.newpassword, 10);
        user.save();
        res.json(user);
        console.log(user.username, " updated his password.");
      } else {
        res.json({ message: "Passwords don't match" });
      }
    } else {
      res.json({ message: "Invalid or expired token." });
    }
  }
});

module.exports = resetPassword;
