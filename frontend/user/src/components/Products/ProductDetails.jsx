import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/axios/userAxios';


const ProductDetail = () => {
  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSpecs, setShowSpecs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [brand,setBrand] = useState('')
  const { id } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    setLoading(true);
    setError(null);
  
    // Fetch product details first
    axiosInstance
      .get(`/showProductsById/${id}`)
      .then((productResponse) => {
        const product = productResponse.data.product;
        setProductData(product);
        console.log(product);
  
        // Fetch related products using product's categoryId
        fetchRelatedProducts(product.categoryId);
  
        // Fetch brand details using the brandId from the product data
        return axiosInstance.get(`/showBrandbyId/${product.brandId}`);
      })
      .then((brandResponse) => {
        console.log(brandResponse)
        setBrand(brandResponse.data.brand);
        console.log(brandResponse.data.brand);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Error fetching product or brand');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);
  
  


  




  const fetchRelatedProducts = (category) => {
  axiosInstance
    .get(`/productsByCategory/${category}`)
    .then((response) => {
      setRelatedProducts(response.data.products.filter((product) => product.id !== id));
    })
    .catch(() => {
      console.error('Error fetching related products');
    });
};


const handleShop = (productId) => {
  navigate(`/product_details/${productId}`);
};


  // const handleQuantityChange = (amount) => {
  //   setQuantity(Math.max(1, quantity + amount));
  // };

  const toggleSpecifications = () => {
    setShowSpecs((prev) => !prev);
  };




  // const handleImageClick = () => {
  //   setIsZoomed(!isZoomed);
  // };



  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!productData) return <p>Product not found</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
      <div className="relative flex flex-col">
  {/* Main Image */}
  <div className="w-full">
    <img
      src={productData.productImage[selectedImage]}
      alt={productData.title}
      className="w-full h-[500px] object-contain rounded-lg shadow-lg cursor-pointer transition-transform duration-300 hover:scale-150"
    />
  </div>

  {/* Thumbnail Images */}
  <div className="mt-4 flex space-x-2 overflow-x-auto w-full">
    {productData.productImage.map((image, index) => (
      <img
        key={index}
        src={image}
        alt={`${productData.title} thumbnail ${index + 1}`}
        className={`w-24 h-24 object-cover rounded cursor-pointer ${
          selectedImage === index ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => setSelectedImage(index)}
      />
    ))}
  </div>
</div>


        {/* Product Details Section */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{productData.title}</h1>
          <p className="text-2xl font-bold mb-4">₹{productData.price?.toFixed(2)} <span className='line-through text-red-500 font-thin text-sm'>₹{+productData.price?.toFixed(2)+3000}</span></p>
          <p className="mb-6">{productData.description}</p>
          <p className="mb-6">Available Stock : {productData.availableQuantity}</p>

          {/* Quantity Controls */}
          {/* <div className="flex items-center mb-6">
            <span className="mr-4">Quantity:</span>
            <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)}>
              <span className="text-black">-</span>
            </Button>
            <span className="mx-4">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
              <span className="text-black">+</span>
            </Button>
          </div> */}

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <Button className="flex-1">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline">
              <Heart className="w-4 h-4 text-black" />
            </Button>
          </div>


          <div className="flex space-x-4 mb-8 ">
            <Button className="flex-1">
              Buy Now
            </Button>
          </div>

          {/* Specifications Button */}
          <div>
            <Button variant="outline" onClick={toggleSpecifications} className="w-full text-black">
              Specifications {showSpecs ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
            </Button>
            {showSpecs && (
              <div className="mt-4 border p-4 rounded-lg bg-gray-200 text-black">
                <ul className="list-disc list-inside">
                  <li><strong>Brand:</strong> {brand.name || 'N/A'}</li>
                  <li><strong>Model:</strong> {productData.specifications.model}</li>
                  <li><strong>Series:</strong> {productData.specifications.series}</li>
                  <li><strong>Color:</strong> {productData.color}</li>
                  <li><strong>Weight:</strong> {productData.specifications.itemWeight}</li>
                  <li><strong>Dimensions:</strong> {productData.specifications.dimensions}</li>
                  <li><strong>Manufacturer:</strong> {productData.specifications.manufacturer}</li>
                  <li><strong>Country of Origin:</strong> {productData.specifications.countryOfOrigin}</li>
                  <li><strong>Warranty:</strong> {productData.specifications.warranty}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-12 flex flex-col items-center">
  <h2 className="text-2xl font-bold mb-4">Related Products</h2>
  {relatedProducts.length > 0 ? (
    <div className="grid md:grid-cols-3 gap-6 justify-center">
      {relatedProducts.map((product) => (
        <div key={product.id} className="border p-4 rounded-lg shadow-lg">
          <img
            src={product.productImage[0]}
            alt={product.title}
            className="w-full h-48 object-contain mb-4 rounded"
          />
          <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
          <p className="text-gray-700 mb-2 text-black">₹{product.price?.toFixed(2)}</p>
          <Button variant="outline" className="text-black " onClick={() => handleShop(product._id)} to={`/product/${product.id}`}>
            View Details
          </Button>
        </div>
      ))}
    </div>
  ) : (
    <p>No related products found.</p>
  )}
</div>

      {/* Header for Reviews */}
      <div className="mt-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Review</h1>

        {/* Customer Reviews Section */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>
          <div className="space-y-6 text-black">
            <div className="border p-4 rounded-lg bg-gray-100">
              <p className="font-semibold">John Doe</p>
              <p className="text-sm text-gray-600 mb-2">⭐⭐⭐⭐⭐</p>
              <p>"Excellent product! The quality exceeded my expectations. Highly recommend it!"</p>
            </div>
            <div className="border p-4 rounded-lg bg-gray-100">
              <p className="font-semibold">Jane Smith</p>
              <p className="text-sm text-gray-600 mb-2">⭐⭐⭐⭐</p>
              <p>"Good value for the price. Works well, but shipping took a bit longer than expected."</p>
            </div>
            <div className="border p-4 rounded-lg bg-gray-100">
              <p className="font-semibold">Michael Brown</p>
              <p className="text-sm text-gray-600 mb-2">⭐⭐⭐⭐⭐</p>
              <p>"Amazing product! Customer service was also very helpful and responsive."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
