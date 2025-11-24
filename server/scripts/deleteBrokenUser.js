const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../utils/schemas/UserSchema');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const deleteBrokenUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'www.555darshanrdn@gmail.com';

        // We use deleteOne with email because findById/save will fail due to ID type mismatch
        const result = await User.deleteOne({ email });

        if (result.deletedCount > 0) {
            console.log(`Successfully deleted user with email: ${email}`);
            console.log('The user can now register again with a clean account.');
        } else {
            console.log(`User with email ${email} not found.`);
        }

        process.exit();
    } catch (error) {
        console.error('Error deleting user:', error);
        process.exit(1);
    }
};

deleteBrokenUser();
