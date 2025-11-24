const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});

        console.log('\n--- REGISTERED USERS ---');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(user => {
                console.log(`ID: ${user._id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role} | Blocked: ${user.isBlocked}`);
            });
        }
        console.log('------------------------\n');

        process.exit();
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
};

listUsers();
