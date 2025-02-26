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
    async getAddresses(page: any, limit: any, userId: string) {

        try {
            const addresses = await Address.find({ userId })
                .skip(page * 5)
                .limit(5);

            const totalCount = await Address.countDocuments();
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

    // Set default address 
    async setDefaultAddress(addressId: any) {
        try {
            // Find the address by ID
            const address = await Address.findById(addressId).populate('userId', 'name email');
            if (!address) {
                throw new Error('Address not found!');
            }

            // Update all addresses of the user to set isDefault as false
            await Address.updateMany({ userId: address.userId }, { isDefault: false });

            // Set the selected address as default
            address.isDefault = true;
            await address.save();

            return { message: 'Address set as default successfully!', statusCode: 200 };
        } catch (error: any) {
            throw new Error(`Error setting default address: ${error.message}`);
        }
    }
}

export const addressService = new AddressService();
