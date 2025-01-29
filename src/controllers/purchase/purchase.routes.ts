// routes/purchase.routes.ts
import { Router } from 'express';
import { loggedIn } from '../../middlewares/auth.middleware';
import { purchaseController } from './purchase.controller';

const purchaseRoute = Router();

// Create a new purchase
purchaseRoute.post('/create', loggedIn, purchaseController.createPurchase);

// Fetch all purchases with optional filters
purchaseRoute.get('/list', loggedIn, purchaseController.getPurchases);

// Fetch a single purchase by its ID
purchaseRoute.get('/:id', loggedIn, purchaseController.getPurchaseById);

// Update a purchase by its ID
purchaseRoute.patch('/:id', loggedIn, purchaseController.updatePurchase);

// Delete a purchase by its ID
purchaseRoute.delete('/:id', loggedIn, purchaseController.deletePurchase);

export default purchaseRoute;
