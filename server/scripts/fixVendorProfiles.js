const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');

dotenv.config();

const fixVendorProfiles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const vendors = await User.find({ role: 'vendor' });
        console.log(`Found ${vendors.length} users with role 'vendor'`);

        for (const vendor of vendors) {
            const profile = await VendorProfile.findOne({ user: vendor._id });
            if (!profile) {
                console.log(`Creating profile for vendor: ${vendor.name} (${vendor._id})`);
                await VendorProfile.createOne({
                    user: vendor._id,
                    businessName: vendor.name + "'s Services",
                    serviceType: 'Other', // Default
                    description: 'Professional vendor services.',
                    pricing: 'Contact for pricing',
                    location: 'Not specified',
                    portfolio: []
                });
            } else {
                console.log(`Profile exists for: ${vendor.name}`);
            }
        }

        console.log('Vendor profile check complete.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixVendorProfiles();
