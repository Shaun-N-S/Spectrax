import React, { useState, useEffect } from "react";
import axiosInstance from "../../axios/userAxios";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import FilterComponent from "./Filter";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false); 


  const userDetails = useSelector((state)=>state.user)
  const getUserId = (userDetails)=>{
    return userDetails?.user?._id || userDetails?.user?.id
  }
  // console.log(userId)

  useEffect(() => {
    axiosInstance
      .get("/showproductsisActive")
      .then((response) => {
        setProducts(response.data.products);
        
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching products");
        setLoading(false);
      });
  }, []);

  const navigate = useNavigate();

  const userId = getUserId(userDetails)
  const handleCart = async (userId, productId, variantId) => {
    console.log("UserId:", userId);
  console.log("ProductId:", productId);
  console.log("VariantId:", variantId);

    try {
      await axiosInstance.post(
        '/Cart',
        { 
          userId,
          productId,
          variantId,
          quantity: 1
        },
        { withCredentials: true } 
      );
      
      console.log("Product added to cart successfully");
      toast.success("Added to cart");
      navigate('/cart');
    } catch (error) {
      console.log("Error in handle cart:", error || error.message);
      toast.error("Product out of stock  ");
    }
  };
  
  

  const handleShop = (productId) => {
    navigate(`/product_details/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-500 text-xl font-bold">
        {error}
      </div>
    );
  }

  console.log(products._id)
  return (
    <div className="bg-black min-h-screen text-white py-12 px-4 sm:px-6 lg:px-8">
      
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-green-400 mb-12 tracking-tight">
          Our Products
        </h1>
        <FilterComponent 
  isOpen={isFilterOpen} 
  setIsOpen={setIsFilterOpen}
  setProducts={setProducts}
/>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product._id}
              className="bg-gray-900 border-2 border-green-500 shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-green-500/50 hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={product.productImage[0]}
                  alt={product.title}
                  className="w-full h-64 object-cover"
                />
                <Badge
                  variant="outline"
                  className="absolute top-4 right-4 bg-black/70 text-green-400 border-green-400"
                >
                  {product.specifications?.series}
                </Badge>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-2 truncate">
                  {product.title}
                </h2>
                <p className="text-gray-400 mb-4 h-12 overflow-hidden">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-green-400 text-2xl font-bold">
                  ₹{product.price}
                  </span>
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={index < 4 ? "text-yellow-400" : "text-gray-600"}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition-colors duration-300"
                    onClick={()=>handleCart(userId, product._id, product.variants?.[0]?._id)}
                    
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="default"
                    className="w-full bg-green-500 text-black hover:bg-green-600 transition-colors duration-300"
                    onClick={() => handleShop(product._id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        

      </div>
    </div>
  );
};

export default ProductPage;

