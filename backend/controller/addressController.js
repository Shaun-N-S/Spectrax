const Address = require('../models/addressSchema');
const User = require('../models/userModel');

const addAddress = async (req, res) => {
  
    try {
      console.log(req.body)
        const { userId, address, city, state, pinCode, country } = req.body;

        
        if (!userId || !address || !city || !state || !pinCode || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingAddress = await Address.findOne({ userId, address, city, state, pinCode, country });
        if (existingAddress) {
            return res.status(409).json({ message: "Address already exists" });
        }

        const newAddress = new Address({
            userId,
            address,
            city,
            state,
            pinCode,
            country,
        });

        await newAddress.save();

        return res.status(201).json({ message: "Address added successfully", newAddress });
    } catch (error) {
        console.log("Error in addAddress:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};




const fetchAddress = async (req, res) => {
  console.log("fetchAddress")
    try {
        const { id: userId } = req.params; // Extract userId from req.params
        console.log("suer ID........",userId)
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch address associated with the user
        const address = await Address.find({ userId , status:'active' });

        return res.status(200).json({ message: "Address fetched successfully", address });

    } catch (error) {
        console.error("Error in fetching address:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const updateAddressStatus = async (req, res) => {
    try {
      const addressId = req.params.id;
  
      // Find the address by ID
      const address = await Address.findById(addressId);
  
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
  
      
      const newStatus = address.status === 'active' ? 'Blocked' : 'active';
  
      // Update the status in the database
      address.status = newStatus;
      await address.save();
  
      res.status(200).json({ 
        message: `Address status changed to ${newStatus} successfully`, 
        address 
      });
    } catch (error) {
      console.error("Error updating address status:", error);
      res.status(500).json({ message: "Failed to update address status" });
    }
  };
  

  const updateAddress = async (req, res) => {
    try {
      const { id } = req.params; // Get address ID from URL params
      const { userId, address, city, state, pinCode, country } = req.body; // Destructure updated fields from request body
  
      // Validate required fields
      if (!id || !userId) {
        return res.status(400).json({ message: "Address ID and User ID are required." });
      }
  
      // Find the address by ID and verify ownership
      const existingAddress = await Address.findOne({ _id: id, userId });
  
      if (!existingAddress) {
        return res.status(404).json({ message: "Address not found or unauthorized." });
      }
  
      // Update address fields
      existingAddress.address = address || existingAddress.address;
      existingAddress.city = city || existingAddress.city;
      existingAddress.state = state || existingAddress.state;
      existingAddress.pinCode = pinCode || existingAddress.pinCode;
      existingAddress.country = country || existingAddress.country;
  
      // Save updated address
      await existingAddress.save();
  
      res.status(200).json({ message: "Address updated successfully", data: existingAddress });
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ message: "Failed to update address", error: error.message });
    }
  };

  const fetchAddressById = async (req, res) => {
    try {
      const { id } = req.params; // Match the route parameter name
  
      if (!id) {
        return res.status(400).json({ message: "Address ID is required" });
      }
  
      const shippingAddress = await Address.findById(id); 
  
      if (!shippingAddress) {
        return res.status(404).json({ message: "Address not found" });
      }
  
      return res.status(200).json({
        message: "Address found successfully",
        address: shippingAddress,
      });
    } catch (error) {
      console.error("Error fetching address:", error);
      return res.status(500).json({ message: "Error fetching address", error: error.message });
    }
  };
  




module.exports = {
    addAddress,
    fetchAddress,
    updateAddressStatus,
    updateAddress,
    fetchAddressById,
};
