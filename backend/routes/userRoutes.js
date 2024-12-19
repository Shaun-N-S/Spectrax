const express = require("express");
const userRoutes = express.Router();
const {signup,login,verifyOtp,resendOtp, googleAuth,refreshAccessToken} = require('../controller/userController')
const { verifyAccessToken } = require('../middleware/authMiddleware');
const { showProducts, showProductById, productsByCategory } = require("../controller/productController");
const { showBrandbyId } = require("../controller/brandController");




userRoutes.post("/sign",signup);
userRoutes.post("/login",login);
userRoutes.post("/verify-otp", verifyOtp); 
userRoutes.post("/resend-otp", resendOtp);
userRoutes.post("/google-auth",googleAuth);

userRoutes.post('/refresh-token', refreshAccessToken);

userRoutes.get('/showproducts', showProducts);
userRoutes.get('/showProductsById/:id', showProductById);
userRoutes.get('/productsByCategory/:id',productsByCategory)

userRoutes.get('/showBrandbyId/:id',showBrandbyId)


userRoutes.get('/protected', verifyAccessToken, (req, res) => {
  res.json({ message: 'You have access to this protected route!', user: req.user });
});




module.exports = userRoutes;
