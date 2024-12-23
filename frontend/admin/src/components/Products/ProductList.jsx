import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming Shadcn Button component is available
import AdminSidebar from '../SideBar/AdminSidebar';
import axiosInstance from '@/axios/adminAxios';
import { toast } from 'react-toastify';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/showproducts')
      .then(response => {
        console.log('API Response:', response.data);
        setProducts(response.data.products);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Error fetching products');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axiosInstance.get('/getallcategory')
      .then((res) => setCategories(res.data.categories))
      .catch(() => console.error('Error fetching categories'));
  }, []);

  const handleStatusToggle = (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

    axiosInstance.patch(`/toggleProductStatus/${productId}`, { status: newStatus })
      .then(() => {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId ? { ...product, status: newStatus } : product
          )
        );
      })
      .catch(err => {
        console.error('Error updating product status:', err);
        toast.error('Error updating product status');
      });
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar className="w-64 min-h-screen bg-white shadow-md" />

      <div className="flex-1 p-6 max-w-screen-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Product List</h2>
          <Button onClick={() => navigate('/add-product')} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Product
          </Button>
        </div>

        {currentProducts.length === 0 ? (
          <div className="text-center py-4 text-gray-600">No products found.</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Product Image</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Product Name</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Price</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product) => (
                    <tr key={product._id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img
                          src={product.productImage[0]}
                          className="w-20 h-20 object-cover rounded"
                          alt={product.title}
                        />
                      </td>
                      <td className="px-6 py-4">{product.title}</td>
                      <td className="px-6 py-4">
                        {categories.find((cat) => cat._id === product.categoryId)?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">${product.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {product.status === 'active' ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product._id)}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant={product.status === 'active' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => handleStatusToggle(product._id, product.status)}
                        >
                          {product.status === 'active' ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-1" /> Block
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-1" /> Activate
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(products.length / productsPerPage) }, (_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? 'default' : 'outline'}
                  onClick={() => paginate(index + 1)}
                  className="px-3 py-1"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;
