import Cart from "./cart.model";
import Product from "../product/product.model";

class CartService {

    async addToCart(userId: any, productId: any, quantity: any) {
        const cart = await Cart.findOne({ userId });

        if (cart) {
            const productIndex = cart.products.findIndex(p => p.productId.equals(productId));

            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }

            await cart.save();
        } else {
            const newCart = new Cart({ userId, products: [{ productId, quantity }] });
            await newCart.save();
        }

        return { message: 'Product added to cart successfully!' };
    }

    // Remove from cart
    async removeFromCart(userId: any, productId: any, quantity: any) {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return { message: 'Your cart is empty!', status: true, statusCode: 400 };
        }

        const productIndex = cart.products.findIndex(p => p.productId.equals(productId));

        if (productIndex === -1) {
            return { message: 'Product not found in cart!', status: true, statusCode: 400 };
        }

        if (cart.products[productIndex].quantity > quantity) {
            cart.products[productIndex].quantity -= quantity;
        } else {
            cart.products.splice(productIndex, 1);
        }

        await cart.save();
        return { message: 'Product removed from cart successfully!' };
    }

    // Empty cart
    async emptyCart(userId: any) {
        const cart = await Cart.findOneAndDelete({ userId });
        if (!cart) {
            throw new Error('Cart not found!');
        }

        return { message: 'Cart emptied successfully!' };
    }

    async getCartDetails(userId: any) {
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        if (!cart) {
            return { message: 'Your cart is empty!', status: true, statusCode: 422 };
        }

        let totalValue = 0;
        let totalQuantity = 0;
        const productDetails = [];

        for (const item of cart.products) {
            const product = item.productId as any;
            const quantity = item.quantity;
            const productPrice = product.price;

            totalValue += productPrice * quantity;
            totalQuantity += quantity;

            productDetails.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0].url,
                description: product.description,
                quantity,
                totalPrice: productPrice * quantity
            });
        }

        return {
            cart: {
                totalQuantity,
                totalValue,
                products: productDetails
            }
        };
    }
}

export const cartService = new CartService();