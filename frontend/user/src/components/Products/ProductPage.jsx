import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../admin/src/axios/adminAxios"; 
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/showproducts") 
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

  const handleShop = (productId) => {
    navigate(`/product_details/${productId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="bg-black min-h-screen text-white py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-green-400 mb-8">
          Our Products
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product._id}
              className="bg-black border border-green-500 shadow-lg rounded-lg"
            >
              <div className="flex flex-col items-center p-4">
                <img
                  src={product.productImage[0]} 
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-semibold text-green-400 mb-2">
                  {product.title}
                </h2>
                <p className="text-gray-400 text-center mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center w-full mb-4">
                  <Badge variant="outline" className="text-green-400">
                    {product.specifications?.series} 
                  </Badge>
                  <div className="flex items-center text-yellow-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span key={index}>
                        {index < 4 ? "★" : "☆"} 
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-green-400 text-xl font-semibold">
                    ${product.price}
                  </span>
                  <Button
                    variant="primary"
                    className="flex items-center bg-green-500 hover:bg-green-600"
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="primary"
                    className="flex items-center bg-green-500 hover:bg-green-600"
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
