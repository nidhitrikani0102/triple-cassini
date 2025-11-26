const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const analyzeUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const allUsers = await User.find({}, 'role isDeleted email');

        console.log('--- USER ANALYSIS ---');
        console.log('Total Documents:', allUsers.length);

        const breakdown = allUsers.reduce((acc, user) => {
            const key = `${user.role} (Deleted: ${user.isDeleted})`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        console.table(breakdown);

        console.log('\n--- DETAILS ---');
        allUsers.forEach(u => {
            console.log(`- ${u.email} | Role: ${u.role} | Deleted: ${u.isDeleted}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

analyzeUsers();
