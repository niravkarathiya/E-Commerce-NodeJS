import User from "../auth/auth.model";
import Cart from "./cart.model";

class CartService {

    async updateCart(userId: any, productId: any, quantity: any, mode: any) {
        const cart = await Cart.findOne({ userId });
        const user = await User.findById(userId);

        if (!cart) {
            if (mode === 'increment') {
                const newCart = new Cart({ userId, products: [{ productId, quantity }] });
                await newCart.save();
                if (user) {
                    user.cartCount += 1;
                    await user.save();
                }
                return { message: 'Product added to cart successfully!' };
            }
            return { message: 'Your cart is empty!', status: true, statusCode: 400 };
        }

        const productIndex = cart.products.findIndex(p => p.productId.equals(productId));

        if (mode === 'increment') {
            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
                if (user) {
                    user.cartCount += 1;
                    await user.save();
                }
            }
            await cart.save();
            return { message: 'Product added to cart successfully!' };
        } else if (mode === 'decrement') {
            if (productIndex === -1) {
                return { message: 'Product not found in cart!', status: true, statusCode: 400 };
            }

            if (cart.products[productIndex].quantity > quantity) {
                cart.products[productIndex].quantity -= quantity;
            } else {
                cart.products.splice(productIndex, 1);
                if (user) {
                    user.cartCount = Math.max(0, user.cartCount - 1);
                    await user.save();
                }
            }

            await cart.save();
            return { message: 'Product removed from cart successfully!' };
        }

        return { message: 'Invalid mode!', status: true, statusCode: 400 };
    }

    // Delete a single product from cart
    async deleteProductFromCart(userId: any, productId: any) {
        const cart = await Cart.findOne({ userId });
        const user = await User.findOne({ _id: userId });
        if (user) {
            user.cartCount -= 1;
            await user.save();
        }

        if (!cart) {
            throw new Error('Cart not found!');
        }

        cart.products.pull({ productId });

        await cart.save();

        return { message: 'Product removed from cart successfully!' };
    }

    // Empty cart
    async emptyCart(userId: any) {
        const cart = await Cart.findOneAndDelete({ userId });
        const user = await User.findOne({ _id: userId });
        if (user) {
            user.cartCount = 0;
            await user.save();
        }
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
                totalPrice: productPrice * quantity,
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