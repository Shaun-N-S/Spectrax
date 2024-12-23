const express = require("express");
const userRoutes = express.Router();
const {signup,login,verifyOtp,resendOtp, googleAuth,refreshAccessToken, logoutUser} = require('../controller/userController')
const { verifyAccessToken } = require('../middleware/authMiddleware');
const { showProducts, showProductById, productsByCategory, showProductsIsActive } = require("../controller/productController");
const { showBrandbyId } = require("../controller/brandController");
// const { verifyUser } = require("../middleware/userAuth");




userRoutes.post("/sign",signup);
userRoutes.post("/login",login);
userRoutes.post('/logout',logoutUser)
userRoutes.post("/verify-otp", verifyOtp); 
userRoutes.post("/resend-otp", resendOtp);
userRoutes.post("/google-auth",googleAuth);



userRoutes.get('/refresh-token', refreshAccessToken);
userRoutes.post('/verifytoken', verifyAccessToken, (req, res) => {
    // After middleware validates token, send success response
    res.json({ valid: true, user: req.user });
});



userRoutes.get('/showproductsisActive', showProductsIsActive);
userRoutes.get('/showproducts', showProducts);
userRoutes.get('/showProductsById/:id', showProductById);
userRoutes.get('/productsByCategory/:id',productsByCategory)

userRoutes.get('/showBrandbyId/:id',showBrandbyId)


// userRoutes.get('/protected', verifyAccessToken, (req, res) => {
//   res.json({ message: 'You have access to this protected route!', user: req.user });
// });




module.exports = userRoutes;
