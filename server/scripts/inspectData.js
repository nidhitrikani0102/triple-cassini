const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const inspectData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const events = await mongoose.connection.db.collection('events').find().toArray();
        console.log(`Total Events: ${events.length}`);
        events.forEach(e => {
            console.log(`Event ID: ${e._id} (Type: ${typeof e._id}) | User: ${e.user} (Type: ${typeof e.user})`);
        });

        const users = await mongoose.connection.db.collection('users').find().toArray();
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => {
            console.log(`User ID: ${u._id} (Type: ${typeof u._id}) | Role: ${u.role}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

inspectData();
