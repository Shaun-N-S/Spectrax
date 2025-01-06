const express = require("express");
const userRoutes = express.Router();
const {signup,login,verifyOtp,resendOtp, googleAuth,refreshAccessToken,forgotPassword,forgotPasswordVerifyOtp, logoutUser, resetPassword, upadateProfile, userProfile, updatePassword} = require('../controller/userController')
const { verifyAccessToken } = require('../middleware/authMiddleware');
const { showProducts, showProductById, productsByCategory, showProductsIsActive, filteredProduct } = require("../controller/productController");
const { showBrandbyId } = require("../controller/brandController");
const { addAddress, fetchAddress , updateAddressStatus, updateAddress, fetchAddressById} = require("../controller/addressController");
const { AddCart, CartDetails, UpdateQuantity, RemoveItem } = require("../controller/cartController");
const { getAllCategoriesIsactive } = require("../controller/categoryController");
const { getallIsactiveBrands } = require("../controller/brandController");
const { placeOrder, fetchOrders, orderById, orderStatusUpdate } = require("../controller/orderController");
// const { verifyUser } = require("../middleware/userAuth");





userRoutes.post("/sign",signup);
userRoutes.post("/login",login);
userRoutes.post('/logout',logoutUser)
userRoutes.post("/verify-otp", verifyOtp); 
userRoutes.post("/resend-otp", resendOtp);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/forgot-password-verifyOtp", forgotPasswordVerifyOtp);
userRoutes.post('/reset-password',resetPassword)
userRoutes.post("/google-auth",googleAuth);



userRoutes.get('/refresh-token', refreshAccessToken);
userRoutes.post('/verifytoken', verifyAccessToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});



userRoutes.get('/showproductsisActive', showProductsIsActive);
userRoutes.get('/showproducts', showProducts);
userRoutes.get('/showProductsById/:id', showProductById);
userRoutes.get('/productsByCategory/:id',productsByCategory)

userRoutes.get('/showBrandbyId/:id',showBrandbyId)


userRoutes.post('/updateProfile',upadateProfile)
userRoutes.post('/addAddress',addAddress)
userRoutes.get('/User/Address/:id',fetchAddress)
userRoutes.put('/address/:id/status', updateAddressStatus);
userRoutes.put('/User/Address/:id', updateAddress);
userRoutes.get('/User/Details/:id',userProfile)
userRoutes.put('/User/Password',updatePassword)


userRoutes.post('/Cart',AddCart)
userRoutes.post('/cart/details',CartDetails)
userRoutes.patch('/cart/update-quantity',UpdateQuantity)
userRoutes.delete('/cart/remove-item/:id',RemoveItem)


userRoutes.get('/category/active',getAllCategoriesIsactive)
userRoutes.get('/Brand/active',getallIsactiveBrands);

userRoutes.get('/filterProduct',filteredProduct)



userRoutes.post('/place-order',placeOrder)

userRoutes.get('/fetch/Address/:id',fetchAddressById);

userRoutes.get('/fetch/orders/:id',fetchOrders)

userRoutes.get('/fetch/order-details/:id',orderById)

userRoutes.post('/update/order-status/:id', orderStatusUpdate);

// userRoutes.get('/protected', verifyAccessToken, (req, res) => {
//   res.json({ message: 'You have access to this protected route!', user: req.user });
// });




module.exports = userRoutes;
