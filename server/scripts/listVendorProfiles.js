const mongoose = require('mongoose');
const dotenv = require('dotenv');
const VendorProfile = require('../utils/schemas/VendorProfileSchema');
const User = require('../utils/schemas/UserSchema');

dotenv.config();

const listVendorProfiles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const profiles = await VendorProfile.find().populate('user', 'name email');
        console.log(`Found ${profiles.length} profiles`);

        profiles.forEach(p => {
            console.log('--------------------------------------------------');
            console.log(`ID: ${p._id}`);
            console.log(`User: ${p.user ? p.user.name : 'NULL'} (${p.user ? p.user.email : 'NULL'})`);
            console.log(`Business: ${p.businessName}`);
            console.log(`Service: ${p.serviceType}`);
            console.log(`Location: ${p.location}`);
            console.log('--------------------------------------------------');
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listVendorProfiles();
