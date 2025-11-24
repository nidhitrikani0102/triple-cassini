const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const UserModel = require('../utils/schemas/UserSchema');
const UserDAL = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Delete all users
        await UserModel.deleteMany({});
        console.log('All users deleted.');

        // 2. Re-create Super Admins
        const admins = [
            { name: 'Super Admin 1', email: 'admin1@eventempire.com', password: 'AdminPass123!', role: 'admin' },
            { name: 'Super Admin 2', email: 'admin2@eventempire.com', password: 'AdminPass123!', role: 'admin' },
            { name: 'Super Admin 3', email: 'admin3@eventempire.com', password: 'AdminPass123!', role: 'admin' }
        ];

        for (const adminData of admins) {
            await UserDAL.createOne(adminData);
            console.log(`Created admin: ${adminData.email}`);
        }

        console.log('Reset complete. Admins should now have IDs starting from U001.');
        process.exit();
    } catch (error) {
        console.error('Error resetting users:', error);
        process.exit(1);
    }
};

resetUsers();
