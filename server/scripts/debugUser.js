const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const debugUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'www.555darshanrdn@gmail.com';
        console.log(`\nSearching for user with email: ${email}`);

        // 1. Find by Email
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found by email.');
            process.exit();
        }

        console.log('User found!');
        console.log('ID Value:', user._id);
        console.log('ID Type (typeof):', typeof user._id);
        console.log('ID Constructor:', user._id.constructor.name);

        const idString = user._id.toString();
        console.log(`\nTrying to find by String ID: "${idString}"`);

        // 2. Find by String ID
        const userByString = await User.findOne({ _id: idString });
        console.log('Found by String ID?', !!userByString);

        // 3. Find by ObjectId (if valid)
        if (mongoose.Types.ObjectId.isValid(idString)) {
            console.log(`\nTrying to find by ObjectId: ObjectId("${idString}")`);
            // We need to bypass the model's schema definition which might force string
            // So we use the native collection driver or cast explicitly if Mongoose allows
            // But since Schema says String, Mongoose might cast ObjectId back to String for the query?
            // Let's try passing the ObjectId object directly.
            const objectId = new mongoose.Types.ObjectId(idString);
            const userByObjectId = await User.collection.findOne({ _id: objectId });
            console.log('Found by ObjectId (native collection)?', !!userByObjectId);
        }

        process.exit();
    } catch (error) {
        console.error('Error debugging user:', error);
        process.exit(1);
    }
};

debugUser();
