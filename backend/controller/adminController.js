const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLogin = async (req, res) => {
    console.log("adminLogin")
  try {
    const { email, password } = req.body;
    console.log(email,password)
    const adminInfo = await User.findOne({ email });
    // console.log(adminInfo)

    if (!adminInfo) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (adminInfo.isAdmin == true) {
      if (await bcrypt.compare(password, adminInfo.password)) {
        const token = jwt.sign({ id: adminInfo._id }, process.env.JWT_SECERT, { expiresIn: '3d' });

        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          secure: false,
          samesite: "lax"
        });

        return res.status(200).json({
          message: "Login Successful",
          _id: adminInfo._id,
          firstName: adminInfo.firstName,
          lastName: adminInfo.lastName,
          email: adminInfo.email,
          phone: adminInfo.phone
        });
      } else {
        return res.status(401).json({ message: "Invalid password" });
      }
    } else {
      return res.status(403).json({ message: "No access" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



// Fetch all users
const fetchAllUsers = async (req, res) => {
  try {
      
      const users = await User.find({isAdmin:false});

      
      if (!users || users.length === 0) {
          return res.status(404).json({ message: 'No users found' });
      }

      // Return the list of users
      res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};











const logoutAdmin = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    samesite: 'Lax',
  });
  return res.status(200).json({ message: "Logged out successfully" });
};








module.exports = {
  adminLogin,
  logoutAdmin,
  fetchAllUsers,
  
  
};
