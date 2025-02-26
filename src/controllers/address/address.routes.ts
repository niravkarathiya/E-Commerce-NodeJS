import { Router } from "express";
import { addressController } from "./address.controller";
import { loggedIn } from "../../middlewares/auth.middleware";

// Address routes
const addressRoute = Router();

// Create a new address
addressRoute.post('/create', loggedIn, addressController.createAddress);

// Fetch all addresses
addressRoute.get('/list', loggedIn, addressController.getAddresses);

// Fetch a single address by its ID
addressRoute.get('/:id', loggedIn, addressController.getAddressById);

// Update an address by its ID
addressRoute.patch('/:id', loggedIn, addressController.updateAddress);

// Delete an address by its ID
addressRoute.delete('/:id', loggedIn, addressController.deleteAddress);

// Set default address
addressRoute.get('/set-default/:id', loggedIn, addressController.setDefaultAddress);

export default addressRoute;