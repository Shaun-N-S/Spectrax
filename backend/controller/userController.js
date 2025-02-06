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

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const otp = generateOtp();
    console.log("Generated OTP:", otp);

    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    // Store OTP in an HTTP-Only cookie (expires in 5 minutes)
    res.cookie("userOtp", otp, { httpOnly: true, maxAge: 5 * 60 * 1000 });

    // Store user data in another cookie (optional)
    res.cookie("userData", JSON.stringify({ firstName, lastName, email, phone, password }), {
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minutes expiration
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });

    console.log("OTP Sent:", otp);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
};



const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const storedOtp = req.cookies.userOtp;
    const userData = JSON.parse(req.cookies.userData || "{}");

    console.log("Entered OTP:", otp);
    console.log("Stored OTP from Cookie:", storedOtp);

    if (!storedOtp || otp !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const { firstName, lastName, email, phone, password } = userData;

    const hashedPassword = await securePassword(password);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    // Clear cookies after successful registration
    res.clearCookie("userOtp");
    res.clearCookie("userData");

    console.log("User verified successfully and registered");
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





const resendOtp = async (req, res) => {
  try {
    const email = req.body.email || (req.cookies.userData && JSON.parse(req.cookies.userData).email);

    if (!email) {
      return res.status(400).json({ message: "Email is required to resend OTP" });
    }

    const otp = generateOtp();
    console.log("New OTP:", otp);

    // Update OTP in HTTP-Only Cookie
    res.cookie("userOtp", otp, { httpOnly: true, maxAge: 5 * 60 * 1000 });

    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to resend OTP" });
    }

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};





const googleAuth = async (req, res) => {
  try {
      console.log("Received request body:", req.body);
      const { token } = req.body;
      
      if (!token) {
          return res.status(400).json({ message: 'Token is required' });
      }

      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log("Google payload:", payload);

      // Extract name parts
      const fullName = payload.given_name || payload.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0];
      // Join the rest of the parts as lastName, or use a default
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';

      const { email } = payload;

      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
          user = new User({
              firstName,
              lastName,
              email,
              googleAuth: true,
          });
          await user.save();
      }

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

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
      console.error('Detailed Google Auth Error:', {
          message: error.message,
          stack: error.stack,
          name: error.name
      });
      res.status(500).json({ 
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    console.log("Generated OTP:", otp);

    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    // Store OTP and user data in cookies
    res.cookie("userOtp", otp, { httpOnly: true, maxAge: 5 * 60 * 1000 });
    res.cookie("userData", JSON.stringify({ email }), { httpOnly: true, maxAge: 10 * 60 * 1000 });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in forget password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const storedOtp = req.cookies.userOtp;

    console.log("Entered OTP:", otp);
    console.log("Stored OTP from Cookie:", storedOtp);

    if (!otp) {
      return res.status(400).json({ message: "Please enter OTP" });
    }

    if (otp !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.log("Error in verifying forgot password OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userData = JSON.parse(req.cookies.userData || "{}");

    if (!userData.email) {
      return res.status(400).json({ message: "Session expired. Please try again." });
    }

    const user = await User.findOne({ email: userData.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear cookies after resetting password
    res.clearCookie("userOtp");
    res.clearCookie("userData");

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