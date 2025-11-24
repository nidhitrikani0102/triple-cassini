const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cleanData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const result = await mongoose.connection.db.collection('events').deleteOne({ _id: { $type: 'objectId' } });
        console.log(`Deleted ${result.deletedCount} corrupt event(s).`);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanData();
