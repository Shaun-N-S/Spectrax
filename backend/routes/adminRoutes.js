const express = require('express');
const adminRoutes = express.Router();

// Controllers
const { adminLogin, logoutAdmin, fetchAllUsers } = require('../controller/adminController');
const { verifyAdmin } = require('../middleware/verifyAdmin');
const { addProduct, showProducts, editProduct, showProductById, toggleProductStatus } = require('../controller/productController');
const { addCategory, getAllCategories, editCategory, toggleCategoryStatus, getAllCategoriesIsactive } = require('../controller/categoryController');
const { updateUserStatus } = require('../controller/userController');
const { addBrand, getAllBrand, toggleBrandStatus, updateBrandName, getallIsactiveBrands } = require('../controller/brandController');
const { fetchOrders, getallorders, orderStatusUpdate } = require('../controller/orderController');
const { addCoupon, allCoupons, updateCoupon, removeCoupon } = require('../controller/CouponController');
const { addOffer, allOffers, deleteOffers, updateOffer, fetchOfferById } = require('../controller/offerController');
const { salesReport } = require('../controller/salesController');

// ------------------ Authentication Routes ------------------
adminRoutes.post('/login', adminLogin);
adminRoutes.post('/logout', verifyAdmin, logoutAdmin);
// adminRoutes.post('/refreshToken', refreshToken);

// ------------------ User Management Routes ------------------
adminRoutes.get('/fetchallusers', fetchAllUsers);
adminRoutes.patch('/updateuserstatus/:id', updateUserStatus);

// ------------------ Product Management Routes ------------------
adminRoutes.post('/product', addProduct);
adminRoutes.get('/showproducts', showProducts);
adminRoutes.get('/showProductById/:id', showProductById);
adminRoutes.put('/product/:id', editProduct);
adminRoutes.patch('/toggleProductStatus/:id', toggleProductStatus);

// ------------------ Category Management Routes ------------------
adminRoutes.post('/category', addCategory);
adminRoutes.get('/getallcategory', getAllCategories);
adminRoutes.get('/getallcategoryIsactive', getAllCategoriesIsactive);
adminRoutes.put('/editcategory/:id', editCategory);
adminRoutes.patch('/toggleCategoryStatus/:id', toggleCategoryStatus);
// adminRoutes.post('/productsByCategory/:id', productsByCategory);

// ------------------ Brand Management Routes ------------------
adminRoutes.post('/addbrand', addBrand);
adminRoutes.get('/getallbrands', getAllBrand);
adminRoutes.get('/getallIsactiveBrands', getallIsactiveBrands);
adminRoutes.patch('/toggleBrandStatus/:id', toggleBrandStatus);
adminRoutes.patch('/updateBrandName/:id', updateBrandName);

// ------------------ Order Management Routes ------------------
adminRoutes.get('/orders', getallorders);
adminRoutes.post('/order/status/:id', orderStatusUpdate);



// ------------------ Coupon Management Routes ------------------
adminRoutes.post('/Coupon/Add',addCoupon);
adminRoutes.get('/Coupon/fetch',allCoupons);
adminRoutes.post('/Coupon/update',updateCoupon);
adminRoutes.patch('/Coupon/remove',removeCoupon);


// ------------------ Offer Management Routes ------------------
adminRoutes.post('/Offer/Add',addOffer);
adminRoutes.get('/Offer/fetch',allOffers);
adminRoutes.delete('/Offer/remove/:id',deleteOffers);
adminRoutes.put('/Offer/update/:id',updateOffer);


// ------------------ Sales Report Management Routes ------------------
adminRoutes.get('/sales-report',salesReport)


module.exports = adminRoutes;
