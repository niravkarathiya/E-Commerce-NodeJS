import Product from '../../models/product.model';
import { productSchema } from '../../utils/product.validator';

class ProductService {

    // Create a new product
    async createProduct(data: any) {
        const { error } = productSchema.validate(data);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const newProduct = new Product(data);
        await newProduct.save();
        return { success: true, message: 'Product created successfully!', product: newProduct };
    }

    // Fetch a single product by ID
    async getProductById(productId: string) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found!');
        }
        return { success: true, product };
    }

    // Fetch all products with optional filters, pagination, and sorting
    async getProducts(filters = {}, page = 1, limit = 10, sort = {}) {
        const products = await Product.find(filters)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sort);

        const totalCount = await Product.countDocuments(filters);
        return {
            success: true,
            products,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit)
        };
    }

    // Update product by ID
    async updateProduct(productId: string, updateData: any) {
        const { error } = productSchema.validate(updateData, { allowUnknown: true });
        if (error) {
            throw new Error(error.details[0].message);
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
        if (!updatedProduct) {
            throw new Error('Product not found!');
        }

        return { success: true, message: 'Product updated successfully!', product: updatedProduct };
    }

    // Delete product by ID
    async deleteProduct(productId: string) {
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            throw new Error('Product not found!');
        }
        return { success: true, message: 'Product deleted successfully!', product: deletedProduct };
    }

}

export const productService = new ProductService();
