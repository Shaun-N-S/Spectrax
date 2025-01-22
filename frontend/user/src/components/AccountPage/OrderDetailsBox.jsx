import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Package, Truck, CreditCard, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/axios/userAxios';
import { toast } from 'react-hot-toast';

const OrderDetailsBox = ({ order, open, onOpenChange, onStatusUpdate }) => {
  if (!order) return null;

  const handleCancelOrder = async () => {
    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
      toast.error('Orders that are shipped or delivered cannot be cancelled');
      return;
    }
  
    try {
      const response = await axiosInstance.post(
        `/update/order-status/${order._id}`,
        { status: 'Cancelled' }
      );
  
      if (response.data.wallet) {
        const refundAmount = response.data.wallet.lastTransaction.amount;
        toast.success(`Order cancelled and ₹${refundAmount.toFixed(2)} refunded to wallet`);
      } else {
        toast.success('Order cancelled successfully');
      }
      onStatusUpdate(order._id, 'Cancelled');
      onOpenChange(false);
    } catch (error) {
      console.error("Error in cancelling order:", error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };
  

  
  const handleReturnOrder = async () => {
    if (order.orderStatus !== 'Delivered') {
      toast.error('Only delivered orders can be returned');
      return;
    }
  
    try {
      const response = await axiosInstance.post(
        `/update/order-status/${order._id}`,
        { status: 'Returned' }
      );
  
      if (response.data.wallet) {
        const refundAmount = response.data.wallet.lastTransaction.amount;
        toast.success(`Return processed and ₹${refundAmount.toFixed(2)} refunded to wallet`);
      } else {
        toast.success('Return processed successfully');
      }
      onStatusUpdate(order._id, 'Returned');
      onOpenChange(false);
    } catch (error) {
      console.error("Error in returning order:", error);
      toast.error(error.response?.data?.message || 'Failed to process return');
    }
  };
  

  // Helper function to safely display variant details
  const renderVariantValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      // If the value is an object with name or value property
      return value.name || value.value || JSON.stringify(value);
    }
    return String(value);
  };

  // Calculate the subtotal
  const subtotal = order.totalAmount || 0;
  
  // Calculate the discount amount if coupon exists
  const discountAmount = order.coupon?.discountAmount || 0;
  
  // Calculate   amount
  const finalAmount = order.finalAmount || order.totalAmount || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="relative">
          <DialogClose className="absolute right-4 top-4" />
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
              {order.products.map((product, index) => (
                <div 
                  key={index}
                  className="bg-gray-600 p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="flex-1">
                  <div>
                    <h4 className="font-medium text-white">{product.name || 'Product Name'}</h4>
                  </div>
                    <p className="text-sm text-gray-300 mt-1">
                      Quantity: {product.quantity || 1}
                    </p>
                    <p className="text-sm text-gray-300">
                      Price: ₹{product.price || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Section */}
          {order.coupon && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Applied Coupon
              </h3>
              <div className="space-y-2">
                <p className="text-gray-300">Coupon Code: {order.coupon.code}</p>
                <p className="text-gray-300">Discount Amount: ₹{order.coupon.discountAmount}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipping Details */}
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

            {/* Payment Details */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status</span>
                  <span className={`font-medium ${
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
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                {order.coupon && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Discount</span>
                    <span className="font-medium text-green-500">
                      -₹{discountAmount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                  <span className="text-gray-300">Final Amount</span>
                  <span className="font-medium text-lg">₹{finalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-6">
        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Returned' && (
          <>
            {order.orderStatus !== 'Shipped' && order.orderStatus !== 'Delivered' && (
              <Button 
                variant="destructive"
                className="w-40" 
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>
            )}
            {order.orderStatus === 'Delivered' && (
              <Button 
                variant="destructive"
                className="w-40" 
                onClick={handleReturnOrder}
              >
                Return Order
              </Button>
            )}
          </>
        )}
      </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsBox;