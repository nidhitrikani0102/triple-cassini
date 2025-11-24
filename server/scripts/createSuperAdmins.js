const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const createSuperAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const admins = [
            { name: 'Super Admin 1', email: 'admin1@eventempire.com', password: 'AdminPass123!', role: 'admin' },
            { name: 'Super Admin 2', email: 'admin2@eventempire.com', password: 'AdminPass123!', role: 'admin' },
            { name: 'Super Admin 3', email: 'admin3@eventempire.com', password: 'AdminPass123!', role: 'admin' }
        ];

        for (const adminData of admins) {
            const exists = await User.findOne({ email: adminData.email });
            if (exists) {
                console.log(`Admin ${adminData.email} already exists.`);
            } else {
                await User.createOne(adminData);
                console.log(`Created admin: ${adminData.email}`);
            }
        }

        console.log('Super Admin creation process completed.');
        process.exit();
    } catch (error) {
        console.error('Error creating admins:', error);
        process.exit(1);
    }
};

createSuperAdmins();
