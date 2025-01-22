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
            // req.session.userData = null;

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
  console.log("resend otp");
  try {
    const email = req.body.email || (req.session.userData && req.session.userData.email);


    

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
    req.session.userOtp = null;
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
  
      // Generate tokens
   const accessToken = generateAccessToken(user._id);
   const refreshToken = generateRefreshToken(user._id);

   // Store access token and refresh token in HTTP-only cookies
   res.cookie('accessToken', accessToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'Lax',
   });

   res.cookie('refreshToken', refreshToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'Lax',
   });

      res.status(200).json({
        message: 'Google login successful',
        id: user._id,
        name: user.firstName,
        email: user.email,
      });
    } catch (error) {
      console.error('Google Auth Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };



const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user)

    if (user.status === 'blocked'){
      return res.status(400).json({message:'Your account is temporarily restricted. Please contact support.'})
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if(user.role !== 'user'){
      return res.status(400).json({message:'Check your role'})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store access token and refresh token in HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    return res.status(200).json({ message: 'User logged in', user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
};

  

const logoutUser = (req, res) => {
  console.log('reaching here');
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    return res.status(200).json({ message: 'Logged out successfully', });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error during logout' });
  }
};








const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log('Cookies received:', req.cookies);
  console.log('Refresh token:', refreshToken);
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded.id);
    
    // Set the new access token as an HTTP-only cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    // Clear the invalid refresh token
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Invalid or expired refresh token' });
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



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOtp();
    console.log("Generated OTP:", otp); // Remove in production

    // Send verification email with OTP
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    // Store OTP and user data in the session
    req.session.userOtp = otp;
    req.session.userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    };

    // Debug log (Remove in production)
    console.log("Session after setting user data:", req.session);

    // Respond with success message
    res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error in forget password:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log("Entered otp:", otp);
    console.log("session otp:", req.session.userOtp);

    if (!otp) {
      return res.status(400).json({ message: 'Please enter otp' });
    }

    if (otp !== req.session.userOtp) {
      return res.status(400).json({ message: "Invalid Otp" });
    }

    // No need for the third condition since we already checked equality above
    return res.status(200).json({ message: "otp verified successfully" });
    
  } catch (error) {
    console.log('Error in verifying forgot password otp:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const resetPassword = async (req, res) => {
  try {
    // Extract new password from the request body
    const { newPassword } = req.body;

    // Validate session and retrieve email
    if (!req.session.userData || !req.session.userData.email) {
      return res.status(400).json({ message: "Session expired or invalid. Please try again." });
    }

    const email = req.session.userData.email;

    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Clear sensitive session data
    req.session.userData = null;
    req.session.userOtp = null;

    // Respond with success
    res.status(200).json({ success: true, message: "Password reset successfully." });

  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const upadateProfile = async (req,res)=>{
  try {
    
    const {firstName,lastName,email,phone} = req.body;

    if(!email){
      return res.status(400).json({message:"Email is required"});
    }

    const user = await User.findOne({email});

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    if(firstName){
      user.firstName = firstName;
    }
    if(lastName){
      user.lastName = lastName;
    }
    if(phone){
      user.phone = phone;
    }
    
    await user.save();

    return res.status(200).json({message:'Profile updated successfully',user});

  } catch (error) {
    console.log('Error in updating profile:',error);
    return res.status(500).json({message:'Internal server error'});
    
  }
}


const userProfile  = async(req,res)=>{
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    return res.status(200).json({message:"User found successfully",user});

  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"Internal server error"});
  }
}


const updatePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure email is case insensitive
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Stored Password:", user.password); // Debugging Step

    // Verify the old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    console.log("Password Comparison Result:", isPasswordValid); // Debugging Step

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Old password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password Update Error:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    updateUserStatus,
    forgotPassword,
    forgotPasswordVerifyOtp,
    resetPassword,
    upadateProfile,
    userProfile,
    updatePassword,
}