import React from 'react'
import SignUp from './components/signup/SignUp'
import Login from './components/login/Login'
import OtpVerification from './components/otp/otp'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from './components/home/Home'
import ProtectEdit from './components/Protect/userAuth'
import ProtectHome from './components/Protect/userLogin'
import ProductPage from './components/Products/ProductPage'
import Header from './components/Header/Header'
import ProductDetails from './components/Products/ProductDetails'
import ProtectedComponent from './components/Protect/ProtectedComponent'
import Footer from './components/Footer/Footer'
import Breadcrumbs from './components/BreadCrump/BreadCrump'
import { Toaster } from 'react-hot-toast';


const App = () => {
  return (
    <>
    <BrowserRouter>
    <Header/>
    <Breadcrumbs/>
    <Toaster />
    <Routes>
    <Route path='/' element={<ProtectHome><Home/></ProtectHome>}/>
      <Route path="/login" element={<ProtectEdit><Login/></ProtectEdit>} />
      <Route path='/signup' element={<ProtectEdit><SignUp/></ProtectEdit>}/>
      <Route path='/otp' element={<ProtectEdit><OtpVerification/></ProtectEdit>}/>
      <Route path='/home' element={<ProtectHome><Home/></ProtectHome>}/>
      {/* <Route path='/home' element={<Home/>}/> */}
      <Route path='/shop' element={<ProductPage/>}/>
      <Route path='/product_details/:id' element={<ProtectedComponent><ProductDetails/></ProtectedComponent>}/>
    </Routes>
    <Footer/>
    </BrowserRouter>
    </>
  )
}

export default App