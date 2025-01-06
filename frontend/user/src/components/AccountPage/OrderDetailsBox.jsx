import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Package, Truck, CreditCard, Calendar, X } from 'lucide-react';
import { Button } from '../ui/button';
import axiosInstance from '@/axios/userAxios';

const OrderDetailsBox = ({ order, open, onOpenChange }) => {
  if (!order) return null;

  const [productDetails,setProductDetails] = useState([])

  useEffect(()=>{
 
    fetchProductDetails()
  },[order])

  const fetchProductDetails = async () => {
    try {
      // Assuming we need to fetch details for each product in the order
      const productPromises = order.products.map(product => 
        axiosInstance.get(`/showProductsById/${product.productId}`)
      );
      
      const responses = await Promise.all(productPromises);
      const details = responses.map(response => response.data);
      setProductDetails(details);
    } catch (error) {
      console.log("error fetching product details:", error);
    }
  };


  const handleCancelOrder = async () => {
    try {
      const response = await axiosInstance.post(
        `/update/order-status/${order._id}`,
        {
          status: 'Cancelled',
          role: 'user'
        }
      );
      
      if (response.data.updatedOrder) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error in cancelling order:", error);
    }
  };

  console.log("response from order :",productDetails)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="relative">
          <DialogClose className="absolute right-4 top-4">
          </DialogClose>
          <DialogTitle className="text-2xl font-bold">
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6" />
              <span>Order Details</span>
            </div>
          </DialogTitle>
          <div className="flex items-center space-x-2 text-gray-400 mt-2">
            <Calendar className="w-4 h-4" />
            <span>Order placed on {new Date(order.orderDate).toLocaleDateString()}</span>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Products Section */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Products
            </h3>
            <div className="grid gap-4">
              {order.products.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-gray-600 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div>
                    <h4 className="font-medium text-white">{product.name}</h4>
                    {product.variant && (
                          <div className="text-sm text-gray-300">
                            {Object.entries(product.variant).map(([key, value]) => (
                              <p key={key} className="capitalize">
                                {key}: {value}
                              </p>
                            ))}
                          </div>
                        )}
                        </div>
                    <p className="text-sm text-gray-300 mt-1">Quantity: {product.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Details
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.pinCode}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status</span>
                  <span 
                    className={`
                      font-medium 
                      ${
                        order.orderStatus === 'Processing' ? 'text-yellow-500' :
                        order.orderStatus === 'Shipped' ? 'text-blue-500' :
                        order.orderStatus === 'Delivered' ? 'text-green-500' :
                        order.orderStatus === 'Cancelled' ? 'text-red-500' : 
                        'text-gray-500'
                    }`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Payment Method</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                  <span className="text-gray-300">Total Amount</span>
                  <span className="font-medium text-lg">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <Button 
            className="text-red-600 flex w-40" 
            onClick={handleCancelOrder}
          >
            Cancel Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsBox;