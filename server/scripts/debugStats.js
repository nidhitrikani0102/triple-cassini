const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const VendorProfile = require('../models/VendorProfile');
require('dotenv').config();

const debugStats = async () => {
    try {
        // 1. Check DB Data
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const userCount = await User.countDocuments();
        const eventCount = await Event.countDocuments();
        const vendorCount = await VendorProfile.countDocuments();

        console.log('--- DB COUNTS ---');
        console.log(`Users: ${userCount}`);
        console.log(`Events: ${eventCount}`);
        console.log(`Vendors: ${vendorCount}`);

        // 2. Check API
        console.log('\n--- API CHECK ---');
        try {
            const res = await fetch('http://localhost:5000/api/stats/public');
            console.log('API Response Status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('API Response Data:', data);
            } else {
                console.log('API Error Text:', await res.text());
            }
        } catch (err) {
            console.error('API Fetch Error:', err.message);
        }

    } catch (error) {
        console.error('Script Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugStats();
