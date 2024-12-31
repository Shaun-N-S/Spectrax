import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
// import { Toast } from 'react-toastify/dist/components';
import { Save, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/axios/adminAxios";
import cloudAxios from "axios";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    title: "",
    sku: "",
    price: "",
    color: "",
    availableQuantity: 0,
    description: "",
    spec: [],
    status: "active",
    productImage: [],
    categoryId: "",
    specifications: {
      brand: "",
      model: "",
      series: "",
      warranty: "",
      manufacturer: "",
      itemWeight: "",
      countryOfOrigin: "",
    },
  });

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  // const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    title: "",
    sku: "",
    price: "",
    color: "",
    availableQuantity: "",
    description: "",
    categoryId: "",
    specifications: {
      model: "",
      series: "",
      warranty: "",
      manufacturer: "",
      itemWeight: "",
      countryOfOrigin: "",
    },
  });

  // Fetch product data by ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/showProductById/${id}`);
        console.log(" fetched dataaaaaaaa......  ", response.data);

        setProduct(response.data.product);

        const arrimg = response.data.product.productImage.map((img) => {
          return img;
        });

        console.log("img.................", arrimg);

        setImages(arrimg);

        console.log("uploaded images", response.data.product.productImage);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast.error("Failed to load product data");
        setLoading(false);
        setErrors(error);
      }
    };

    fetchData();
  }, [id]);

  // Fetch categories and brands (example logic)
  useEffect(() => {
    const fetchCategoriesAndBrands = async () => {
      try {
        const [categoriesResponse] = await Promise.all([
          axiosInstance.get("/getallcategory"),
          // axiosInstance.get('/brands')
        ]);
        console.log(categoriesResponse.data.categories);
        setCategories(categoriesResponse.data.categories);
        // setBrands(brandsResponse.data.brands);
      } catch (error) {
        console.error("Error fetching categories and brands:", error);
        toast.error("Failed to load categories and brands");
      }
    };

    fetchCategoriesAndBrands();
  }, []);

  const validateField = (fieldName, newValue, fallbackValue) => {
    if (!newValue && !fallbackValue) {
      return `${fieldName} is required`;
    }
    return "";
  };

  const validateSpecifications = (specs) => {
    const newErrors = {};
    if (!specs.model || specs.model.length < 2) {
      newErrors.model = "Model must be at least 2 characters";
    }
    if (!specs.series || specs.series.length < 2) {
      newErrors.series = "Series must be at least 2 characters";
    }
    if (!specs.warranty) {
      newErrors.warranty = "Warranty is required";
    }
    if (!specs.manufacturer || specs.manufacturer.length < 2) {
      newErrors.manufacturer = "Manufacturer must be at least 2 characters";
    }
    if (!specs.itemWeight) {
      newErrors.itemWeight = "Item weight is required";
    }
    if (!specs.countryOfOrigin || specs.countryOfOrigin.length < 2) {
      newErrors.countryOfOrigin =
        "Country of origin must be at least 2 characters";
    }
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    // Validate the field
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSpecificationChange = (key, value) => {
    setProduct((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]:
          value.length < 2
            ? `${
                key.charAt(0).toUpperCase() + key.slice(1)
              } must be at least 2 characters`
            : "",
      },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check if the file is an image
      if (file.type.startsWith("image/")) {
        setImages((prevImages) => [...prevImages, file]); // Store the File object
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrls = [];

      // Filter out blob URLs and log them
      const validImages = images.filter((image) => {
        if (typeof image === "string" && image.startsWith("blob:")) {
          console.log("Blob URL found:", image); // Log the blob URL
          return false; // Exclude this blob URL from being uploaded
        }
        return true; // Keep valid image files
      });

      // Upload only valid image files (not blob URLs)
      for (const image of validImages) {
        console.log("Uploading image:", image); // Log valid image files

        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "products"); // Use your Cloudinary upload preset

        console.log("loooooog not");

        const response2 = await cloudAxios.post(
          "https://api.cloudinary.com/v1_1/djfuu8l1u/image/upload",
          formData
        );
        console.log("......resomse2", response2);

        imageUrls.push(response2.data.secure_url);
      }

      // Prepare the updated product data
      const updatedProduct = { ...product, productImage: imageUrls };
      console.log(" updated.... ", updatedProduct);

      // Send the updated product data to the backend
      await axiosInstance.put(`/product/${id}`, updatedProduct);

      toast.success("Product updated successfully!");
      setTimeout(() => navigate("/products"), 2000); // Delay of 2 seconds to redirect
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  return (
    <div className="flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-gray-800 text-white min-h-screen">
        <h2 className="text-2xl p-4 font-bold">Admin Sidebar</h2>
        <ul className="p-4">
          <li className="mb-2">
            <a href="/products">Products</a>
          </li>
          {/* <li className="mb-2"><a href="/orders">Orders</a></li> */}
        </ul>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-8 bg-gray-100 min-h-screen"
      >
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Product Name</Label>
              <Input
                id="title"
                name="title"
                value={product.title}
                onChange={handleInputChange}
                className={errors.title ? "border-red-500" : ""}
                required
              />
              {errors.title && (
                <p className="text-red-500 text-xs">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={product.categoryId}
                onValueChange={(value) => {
                  setProduct((prev) => ({ ...prev, categoryId: value }));
                  setErrors((prev) => ({ ...prev, categoryId: "" }));
                }}
              >
                <SelectTrigger
                  className={errors.categoryId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-red-500 text-xs">{errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={product.sku}
                onChange={handleInputChange}
                className={errors.sku ? "border-red-500" : ""}
                required
              />
              {errors.sku && (
                <p className="text-red-500 text-xs">{errors.sku}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={product.price}
                onChange={handleInputChange}
                className={errors.price ? "border-red-500" : ""}
                required
              />
              {errors.price && (
                <p className="text-red-500 text-xs">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                value={product.color}
                onChange={handleInputChange}
                className={errors.color ? "border-red-500" : ""}
                required
              />
              {errors.color && (
                <p className="text-red-500 text-xs">{errors.color}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableQuantity">Available Quantity</Label>
              <Input
                id="availableQuantity"
                name="availableQuantity"
                type="number"
                value={product.availableQuantity}
                onChange={handleInputChange}
                className={errors.availableQuantity ? "border-red-500" : ""}
                required
              />
              {errors.availableQuantity && (
                <p className="text-red-500 text-xs">
                  {errors.availableQuantity}
                </p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                className={errors.description ? "border-red-500" : ""}
                required
              />
              {errors.description && (
                <p className="text-red-500 text-xs">{errors.description}</p>
              )}
            </div>

            <div>
              <input type="file" accept="image/*" onChange={handleFileChange} />

              <div className="flex gap-3 flex-wrap">
                {images.map((image, index) => (
                  <div key={index} className="relative w-24">
                    <img
                      src={image}
                      alt=""
                      className="rounded-lg w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)} 
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={product.specifications.model}
                    onChange={(e) =>
                      handleSpecificationChange("model", e.target.value)
                    }
                    className={
                      errors.specifications?.model ? "border-red-500" : ""
                    }
                    required
                  />
                  {errors.specifications?.model && (
                    <p className="text-red-500 text-xs">
                      {errors.specifications.model}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="series">Series</Label>
                  <Input
                    id="series"
                    value={product.specifications.series}
                    onChange={(e) =>
                      handleSpecificationChange("series", e.target.value)
                    }
                    className={
                      errors.specifications?.series ? "border-red-500" : ""
                    }
                    required
                  />
                  {errors.specifications?.series && (
                    <p className="text-red-500 text-xs">
                      {errors.specifications.series}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    value={product.specifications.warranty}
                    onChange={(e) =>
                      handleSpecificationChange("warranty", e.target.value)
                    }
                    className={
                      errors.specifications?.warranty ? "border-red-500" : ""
                    }
                    required
                  />
                  {errors.specifications?.warranty && (
                    <p className="text-red-500 text-xs">
                      {errors.specifications.warranty}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={product.specifications.manufacturer}
                    onChange={(e) =>
                      handleSpecificationChange("manufacturer", e.target.value)
                    }
                    className={
                      errors.specifications?.manufacturer
                        ? "border-red-500"
                        : ""
                    }
                    required
                  />
                  {errors.specifications?.manufacturer && (
                    <p className="text-red-500 text-xs">
                      {errors.specifications.manufacturer}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemWeight">Item Weight</Label>
                  <Input
                    id="itemWeight"
                    value={product.specifications.itemWeight}
                    onChange={(e) =>
                      handleSpecificationChange("itemWeight", e.target.value)
                    }
                    className={
                      errors.specifications?.itemWeight ? "border-red-500" : ""
                    }
                    required
                  />
                  {errors.specifications?.itemWeight && (
                    <p className="text-red-500 text-xs">
                      {errors.specifications.itemWeight}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                  <Input
                    id="countryOfOrigin"
                    value={product.specifications.countryOfOrigin}
                    onChange={(e) =>
                      handleSpecificationChange(
                        "countryOfOrigin",
                        e.target.value
                      )
                    }
                    className={
                      errors.specifications?.countryOfOrigin
                        ? "border-red-500"
                        : ""
                    }
                    required
                  />
                  {errors.specifications?.countryOfOrigin && (
                    <p className="text-red-500 text-xs">
                      {errors.specifications.countryOfOrigin}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProduct;
