const express = require('express');
const adminRoutes = express.Router();
const { adminLogin, logoutAdmin, fetchAllUsers } = require('../controller/adminController');
const { verifyAdmin } = require('../middleware/verifyAdmin');
const { addProduct, showProducts, editProduct,showProductById, toggleProductStatus } = require('../controller/productController');
const { addCategory, getAllCategories, editCategory, toggleCategoryStatus, getAllCategoriesIsactive } = require('../controller/categoryController');
const { updateUserStatus } = require('../controller/userController');
const { addBrand, getAllBrand,toggleBrandStatus, updateBrandName, getallIsactiveBrands } = require('../controller/brandController');
const { fetchOrders, getallorders, orderStatusUpdate } = require('../controller/orderController');

// Authentication Routes
adminRoutes.post('/login', adminLogin);
adminRoutes.post('/logout', verifyAdmin, logoutAdmin);
// adminRoutes.post('/refreshToken', refreshToken);


// User Management Routes
adminRoutes.get('/fetchallusers', fetchAllUsers);
adminRoutes.patch('/updateuserstatus/:id', updateUserStatus);

// Product Management Routes
adminRoutes.post('/product', addProduct);
adminRoutes.get('/showproducts', showProducts);
adminRoutes.put('/product/:id', editProduct);
adminRoutes.get('/showProductById/:id', showProductById);
adminRoutes.patch('/toggleProductStatus/:id', toggleProductStatus);


//  Category Management Routes
adminRoutes.post('/category', addCategory);
adminRoutes.get('/getallcategory', getAllCategories);
adminRoutes.get('/getallcategoryIsactive',getAllCategoriesIsactive)
adminRoutes.patch('/toggleCategoryStatus/:id', toggleCategoryStatus);
adminRoutes.put('/editcategory/:id', editCategory);
// adminRoutes.post('/productsByCategory/:id',productsByCategor)

// Brand Management Routes
adminRoutes.post('/addbrand', addBrand);
adminRoutes.patch('/toggleBrandStatus/:id', toggleBrandStatus);
adminRoutes.get('/getallbrands',getAllBrand);
adminRoutes.get('/getallIsactiveBrands',getallIsactiveBrands);

adminRoutes.patch('/updateBrandName/:id', updateBrandName);

adminRoutes.get('/orders',getallorders)

adminRoutes.post('/order/status/:id',orderStatusUpdate)


module.exports = adminRoutes;
