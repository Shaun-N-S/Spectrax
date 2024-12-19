const express = require('express');
const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { OAuth2Client } = require('google-auth-library');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const securePassword = async(password)=>{
    try {
        return await bcrypt.hash(password,10);
    } catch (error) {
        console.log(error);
    }
}

function generateOtp(){
    return Math.floor(100000 + Math.random()*900000).toString();
}


async function sendVerificationEmail(email,otp) {
    try {
        
        const transporter = nodemailer.createTransport({

            service:'gmail',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const info = await transporter.sendMail({

            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"verify your account",
            text:`Your OTP is ${otp}`,
            html:`<b> Your OTP: ${otp}</b>`,

        })

        return info.accepted.length>0

    } catch (error) {
        console.log("Error sending email",error);
        return false;
        
    }
}

const signup = async (req, res) => {
  try {
      console.log(req.body);

      const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

      // Check if passwords match
      if (password !== confirmPassword) {
          return res.status(400).json({ message: "Passwords do not match" });
      }

      // Check if a user with this email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "User with this email already exists" });
      }

      // Generate OTP
      const otp = generateOtp();
      console.log("Generated OTP:", otp);

      // Send verification email with OTP
      const emailSent = await sendVerificationEmail(email, otp);
      if (!emailSent) {
          return res.status(500).json({ message: "Failed to send verification email" });
      }

      // Store OTP and user data in the session
      req.session.userOtp = otp;
      req.session.userData = { firstName, lastName, email, phone, password };

      // Debug log to verify session data
      console.log("Session after setting user data:", req.session);

      // Respond with success message
      res.status(200).json({ success: true, message: "OTP sent successfully" });

      console.log("OTP Sent:", otp);
      console.log("Session OTP:", req.session.userOtp);
  } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "An internal server error occurred" });
  }
};


const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log('Session User Data:', req.session.userData);
        console.log("session", req.session)
        console.log('Session OTP:', req.session.userOtp);
        console.log('Entered OTP:', otp);

        // Check if the OTP matches
        if (req.session.userOtp && req.session.userOtp === otp) {
            const { firstName, lastName, email, phone, password } = req.session.userData;

            // Hash the password
            const hashedPassword = await securePassword(password);

            // Create and save the new user
            const user = new User({
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
            });

            await user.save();

            // Clear session data
            req.session.userOtp = null;
            req.session.userData = null;

            console.log("User verified successfully and registered");
            return res.status(201).json({ message: 'User registered successfully', user });
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};




const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required to resend OTP" });
    }

    // Generate a new OTP
    const otp = generateOtp();
    console.log(otp)
    req.session.userOtp = otp;
    console.log("otp in session",req.session.userOtp)


    // Send OTP via email
    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to resend OTP" });
    }

    // Save the OTP to the session or database
    req.session.userOtp = otp;

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};








const   googleAuth = async (req, res) => {
    try {
      const { token } = req.body;
  
      // Verify the token with Google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      const { email, given_name: firstName, family_name: lastName } = payload;
  
      // Check if the user already exists
      let user = await User.findOne({ email });
  
      if (!user) {
        // If the user doesn't exist, create a new one
        user = new User({
          firstName,
          lastName,
          email,
          googleAuth: true,
        });
        await user.save();
      }
  
      // Generate JWT token
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECERT, { expiresIn: '30d' });
  
      res.status(200).json({
        message: 'Google login successful',
        id: user._id,
        name: user.firstName,
        email: user.email,
        token: jwtToken,
      });
    } catch (error) {
      console.error('Google Auth Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };




// const login = async (req, res) => {
//     try {
//       const { email, password } = req.body;
//       console.log(password)
//       const user = await User.findOne({ email });
  
//       // Check if the user exists
//       if (!user) {
//         return res.status(401).json({ message: "Invalid email or password" });
//       }
  
//       // Check if the user is an admin
//       if (user.isAdmin === true) {
//         return res.status(403).json({ message: "Admin accounts are not allowed to login here" });
//       }
//       console.log(password)
//       console.log('JWT Secret:', process.env.JWT_SECERT);


      
//       // Compare the provided password with the stored hash
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       console.log('compared password',isPasswordValid)
//       if (!isPasswordValid) {
//         return res.status(401).json({ message: "Invalid email or password" });
//       }
  
//       // Generate JWT token
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECERT, { expiresIn: "30d" });
  
//       // Set the token as a cookie
//       res.cookie("token", token, {
//         httpOnly: true,
//         maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//         secure: process.env.NODE_ENV === "production", // true in production
//         sameSite: "lax",
//       });
  
//       // Respond with success message and user details
//       return res.status(200).json({
//         message: "Login successful",
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       });
//     } catch (error) {
//       console.error("Login error:", error);
//       return res.status(500).json({ message: "An internal server error occurred" });
//     }
//   };


const login = async (req, res) => {
  console.log('ajksdnflads')
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the provided password matches the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });
    return res.status(200).json({message:"user logged in",accessToken,user})
    // res.status(200).json({
    //   message: 'Login successful',
    //   accessToken,
    //   id: user._id,
    //   name: user.firstName,
    //   email: user.email,
    // });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
};

  

const logoutUser = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });

  res.status(200).json({ message: 'Logged out successfully' });
};






const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded.id);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
  




// Controller to update the user's status
const updateUserStatus = async (req, res) => {
  const { id } = req.params;         // Extract user ID from request parameters
  const { status } = req.body;       // Extract the new status from request body

  try {
    // Find the user by ID and update the status field
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated user document
    );

    // If no user found, send a 404 response
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the updated user data
    res.status(200).json({ message: 'User status updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};







module.exports = {
    signup,
    login,
    verifyOtp,
    resendOtp,
    logoutUser,
    googleAuth,
    refreshAccessToken,
    updateUserStatus
}