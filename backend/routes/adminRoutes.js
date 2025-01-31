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
const { salesReport, getSalesAnalytics } = require('../controller/salesController');
const { verifyRoute } = require('../middleware/verifyRoute');

// ------------------ Authentication Routes ------------------
adminRoutes.post('/login', adminLogin);
adminRoutes.post('/logout', verifyRoute,verifyAdmin, logoutAdmin);

// ------------------ User Management Routes ------------------
adminRoutes.get('/fetchallusers', verifyRoute, fetchAllUsers);
adminRoutes.patch('/updateuserstatus/:id', verifyRoute, updateUserStatus);

// ------------------ Product Management Routes ------------------
adminRoutes.post('/product', verifyRoute, addProduct);
adminRoutes.get('/showproducts', verifyRoute, showProducts);
adminRoutes.get('/showProductById/:id', verifyRoute, showProductById);
adminRoutes.put('/product/:id', verifyRoute, editProduct);
adminRoutes.patch('/toggleProductStatus/:id', verifyRoute, toggleProductStatus);

// ------------------ Category Management Routes ------------------
adminRoutes.post('/category', verifyRoute, addCategory);
adminRoutes.get('/getallcategory', verifyRoute, getAllCategories);
adminRoutes.get('/getallcategoryIsactive', verifyRoute, getAllCategoriesIsactive);
adminRoutes.put('/editcategory/:id', verifyRoute, editCategory);
adminRoutes.patch('/toggleCategoryStatus/:id', verifyRoute, toggleCategoryStatus);

// ------------------ Brand Management Routes ------------------
adminRoutes.post('/addbrand', verifyRoute, addBrand);
adminRoutes.get('/getallbrands', verifyRoute, getAllBrand);
adminRoutes.get('/getallIsactiveBrands', verifyRoute, getallIsactiveBrands);
adminRoutes.patch('/toggleBrandStatus/:id', verifyRoute, toggleBrandStatus);
adminRoutes.patch('/updateBrandName/:id', verifyRoute, updateBrandName);

// ------------------ Order Management Routes ------------------
adminRoutes.get('/orders', verifyRoute, getallorders);
adminRoutes.post('/order/status/:id', verifyRoute, orderStatusUpdate);

// ------------------ Coupon Management Routes ------------------
adminRoutes.post('/Coupon/Add', verifyRoute, addCoupon);
adminRoutes.get('/Coupon/fetch', verifyRoute, allCoupons);
adminRoutes.post('/Coupon/update', verifyRoute, updateCoupon);
adminRoutes.patch('/Coupon/remove', verifyRoute, removeCoupon);

// ------------------ Offer Management Routes ------------------
adminRoutes.post('/Offer/Add', verifyRoute, addOffer);
adminRoutes.get('/Offer/fetch', verifyRoute, allOffers);
adminRoutes.delete('/Offer/remove/:id', verifyRoute, deleteOffers);
adminRoutes.put('/Offer/update/:id', verifyRoute, updateOffer);

// ------------------ Sales Report Management Routes ------------------
adminRoutes.get('/sales-report', verifyRoute, salesReport);
adminRoutes.get('/sales-analytics', verifyRoute, getSalesAnalytics);

module.exports = adminRoutes;
