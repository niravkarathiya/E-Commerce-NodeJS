// routes/product.routes.ts
import { Router } from 'express';
import { loggedIn } from '../../middlewares/auth.middleware';
import { productController } from './product.controller';
import { isAdmin } from '../../middlewares/role-based.middleware';

const productRoute = Router();

// Create a new product
productRoute.post('/create', [loggedIn, isAdmin], productController.createProduct);

// Fetch all products
productRoute.get('/list', productController.getProducts);

// Fetch a single product by its ID
productRoute.get('/:productId', productController.getProductById);

// Update a product by its ID
productRoute.patch('/:productId', [loggedIn, isAdmin], productController.updateProduct);

// Delete a product by its ID
productRoute.delete('/:productId', [loggedIn, isAdmin], productController.deleteProduct);

export default productRoute;
