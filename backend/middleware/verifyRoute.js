const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyRoute = async (req, res, next) => {
    try {
        let token = req.cookies.token; // Ensure correct token retrieval

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // Verify Token
        const decode = jwt.verify(token, process.env.JWT_SECERT);

        // Find user and check if admin
        req.user = await User.findById(decode.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (!req.user.isAdmin) { // Assuming `isAdmin` is a Boolean field in User model
            return res.status(403).json({ message: "Access denied. Admins only" });
        }

        next(); // Proceed to the next middleware or route
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = { verifyRoute };
