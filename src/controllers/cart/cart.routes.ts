import { Router } from 'express';
import { loggedIn } from '../../middlewares/auth.middleware';
import { cartController } from './cart.controller';

const cartRoute = Router();

// Add product to cart
cartRoute.post('/add', loggedIn, cartController.addToCart);

// Remove product from cart
cartRoute.post('/remove', loggedIn, cartController.removeFromCart);

// Empty the cart
cartRoute.post('/empty', loggedIn, cartController.emptyCart);


// Get cart details
cartRoute.get('/cart/:userId', cartController.getCartDetails);

export default cartRoute;
