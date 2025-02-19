import { Router } from 'express';
import { loggedIn } from '../../middlewares/auth.middleware';
import { cartController } from './cart.controller';

const cartRoute = Router();

// Add product to cart
cartRoute.post('/updateCart', loggedIn, cartController.updateCart);

// Empty the cart
cartRoute.post('/empty', loggedIn, cartController.emptyCart);

// Remove product from cart
cartRoute.delete('/remove-product/:productId', loggedIn, cartController.deleteProductFromCart);

// Get cart details
cartRoute.get('/cart/:userId', cartController.getCartDetails);

export default cartRoute;
