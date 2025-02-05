import { Request, Response, NextFunction } from 'express';
import { addressService } from './address.service';
import { Error } from 'mongoose';

class AddressController {

    // Create a new address
    async createAddress(req: Request, res: Response) {
        try {
            const newAddress = await addressService.createAddress(req.body);
            res.json({
                statusCode: 201,
                message: 'Address created successfully!',
                data: newAddress,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 400,
                message: error.message || 'Address creation failed!',
                status: false,
            });
        }
    }

    // Get address by ID
    async getAddressById(req: Request, res: Response) {
        try {
            const address = await addressService.getAddressById(req.params.id);
            res.json({
                statusCode: 200,
                message: 'Address fetched successfully',
                data: address.address,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 404,
                message: error.message || 'Address not found',
                status: false,
            });
        }
    }

    // Get all addresses with optional filters
    async getAddresses(req: Request, res: Response) {
        const { page = 1, limit = 10, sort = '{}' } = req.query;
        try {
            const addresses = await addressService.getAddresses({}, Number(page), Number(limit), JSON.parse(sort as string));
            res.json({
                statusCode: 200,
                message: 'Addresses fetched successfully',
                data: addresses.addresses,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 400,
                message: error.message || 'Error fetching addresses',
                status: false,
            });
        }
    }

    // Update an address by ID
    async updateAddress(req: Request, res: Response) {
        try {
            const updatedAddress = await addressService.updateAddress(req.params.id, req.body);
            res.json({
                statusCode: 200,
                message: 'Address updated successfully',
                data: updatedAddress,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 400,
                message: error.message || 'Address update failed',
                status: false,
            });
        }
    }

    // Delete an address by ID
    async deleteAddress(req: Request, res: Response) {
        try {
            const deletedAddress = await addressService.deleteAddress(req.params.id);
            res.json({
                statusCode: 200,
                message: 'Address deleted successfully',
                data: deletedAddress,
                status: true,
            });
        } catch (error: any) {
            res.json({
                statusCode: 404,
                message: error.message || 'Address not found',
                status: false,
            });
        }
    }
}

export const addressController = new AddressController();
