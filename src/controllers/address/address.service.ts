import Address from './address.model';

class AddressService {

    // Create a new address
    async createAddress(data: any) {
        try {
            const newAddress = new Address(data);
            await newAddress.save();
            return { message: 'Address created successfully!', address: newAddress };
        } catch (error: any) {
            throw new Error(`Error creating address: ${error.message}`);
        }
    }

    // Fetch a single address by ID
    async getAddressById(addressId: any) {
        try {
            const address = await Address.findById(addressId).populate('userId', 'name email');
            if (!address) {
                throw new Error('Address not found!');
            }
            return { address };
        } catch (error: any) {
            throw new Error(`Error fetching address: ${error.message}`);
        }
    }

    // Fetch all addresses with optional filters, pagination, and sorting
    async getAddresses(filters = {}, page = 1, limit = 10, sort = {}) {
        try {
            const addresses = await Address.find(filters)
                .populate('userId', 'name email')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort(sort);

            const totalCount = await Address.countDocuments(filters);
            return {
                addresses,
                totalCount,
                page,
                totalPages: Math.ceil(totalCount / limit)
            };
        } catch (error: any) {
            throw new Error(`Error fetching addresses: ${error.message}`);
        }
    }

    // Update address by ID
    async updateAddress(addressId: any, updateData: any) {
        try {
            const updatedAddress = await Address.findByIdAndUpdate(addressId, updateData, {
                new: true,
                runValidators: true
            }).populate('userId', 'name email');

            if (!updatedAddress) {
                throw new Error('Address not found!');
            }

            return { message: 'Address updated successfully!', address: updatedAddress };
        } catch (error: any) {
            throw new Error(`Error updating address: ${error.message}`);
        }
    }

    // Delete address by ID
    async deleteAddress(addressId: any) {
        try {
            const deletedAddress = await Address.findByIdAndDelete(addressId);
            if (!deletedAddress) {
                throw new Error('Address not found!');
            }
            return { message: 'Address deleted successfully!', address: deletedAddress };
        } catch (error: any) {
            throw new Error(`Error deleting address: ${error.message}`);
        }
    }
}

export const addressService = new AddressService();
