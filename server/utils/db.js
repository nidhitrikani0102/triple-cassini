const mongoose = require('mongoose');

/**
 * Database Connection Utility
 * Handles the connection to the MongoDB database using Mongoose.
 */

/**
 * Connects to the MongoDB database.
 * Uses the MONGO_URI environment variable.
 * Exits the process with failure code (1) if connection fails.
 */
/**
 * Connects to the MongoDB database.
 * Uses the MONGO_URI environment variable defined in the .env file.
 * This function is asynchronous because connecting to a database takes time.
 */
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using Mongoose
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, // Use the new URL parser (recommended)
            useUnifiedTopology: true, // Use the new Server Discovery and Monitoring engine (recommended)
        });
        console.log('MongoDB Connected...'); // Log success message
    } catch (err) {
        // If connection fails, log the error message
        console.error(err.message);
        // Exit the process with failure code (1) to stop the server from running without a DB
        process.exit(1);
    }
};

module.exports = connectDB;
