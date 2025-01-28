// routes/product.routes.ts
import { Router } from 'express';
import { loggedIn } from '../../middlewares/auth/auth.middleware';
import { productController } from '../../controllers/product/product.controller';

const productRoute = Router();

// Create a new product
productRoute.post('/create', loggedIn, productController.createProduct);

// Fetch all products
productRoute.get('/list', productController.getProducts);

// Fetch a single product by its ID
productRoute.get('/:productId', productController.getProductById);

// Update a product by its ID
productRoute.patch('/:productId', loggedIn, productController.updateProduct);

// Delete a product by its ID
productRoute.delete('/:productId', loggedIn, productController.deleteProduct);

export default productRoute;
