const mongoose = require('mongoose');
const dotenv = require('dotenv');
const VendorProfile = require('../utils/schemas/VendorProfileSchema');
const User = require('../utils/schemas/UserSchema');

dotenv.config();

const debugSearch = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Test 1: List all vendors
        const allVendors = await VendorProfile.find().populate('user', 'name email');
        console.log(`Total Vendors: ${allVendors.length}`);
        allVendors.forEach(v => console.log(`- ${v.user?.name} | ${v.serviceType} | ${v.location}`));

        // Test 2: Search by Location (Case Insensitive)
        const locationQuery = 'banglore';
        const locVendors = await VendorProfile.find({ location: { $regex: locationQuery, $options: 'i' } }).populate('user');
        console.log(`Search 'banglore': Found ${locVendors.length}`);

        // Test 3: Search by Service Type
        const serviceQuery = 'Photography';
        const servVendors = await VendorProfile.find({ serviceType: { $regex: serviceQuery, $options: 'i' } }).populate('user');
        console.log(`Search 'Photography': Found ${servVendors.length}`);

        // Test 4: Combined Search
        const combinedVendors = await VendorProfile.find({
            location: { $regex: 'bang', $options: 'i' },
            serviceType: { $regex: 'photo', $options: 'i' }
        }).populate('user');
        console.log(`Search 'bang' + 'photo': Found ${combinedVendors.length}`);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugSearch();
