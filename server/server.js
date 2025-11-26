const express = require('express'); // Express framework for building web servers
const dotenv = require('dotenv'); // Loads environment variables from .env file
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing (allows frontend to talk to backend)
const helmet = require('helmet'); // Middleware to set secure HTTP headers
const connectDB = require('./utils/db'); // Custom utility to connect to MongoDB
const path = require('path'); // Node.js built-in module for handling file paths

// Load env vars
dotenv.config(); // Reads the .env file and makes variables available in process.env

// Connect to database
connectDB(); // Initiates the connection to MongoDB

const app = express(); // Initialize the Express application

// Middleware
// Helmet helps secure the app by setting various HTTP headers
// We configure it to allow resources (images) to be loaded from cross-origin sources (needed for our uploads)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests (req.body)

// Serve static files from the 'uploads' directory
// This allows us to access uploaded images via URL (e.g., http://localhost:5000/uploads/image.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger: Logs details of every incoming request to a file
app.use(require('./utils/requestLogger'));

// Routes: Define the API endpoints
app.use('/api/auth', require('./routes/authRoutes')); // Authentication (Login, Register)
app.use('/api/events', require('./routes/eventRoutes')); // Event management
app.use('/api/guests', require('./routes/guestRoutes')); // Guest management
app.use('/api/vendors', require('./routes/vendorRoutes')); // Vendor profiles and search
app.use('/api/budget', require('./routes/budgetRoutes')); // Budget tracking
app.use('/api/admin', require('./routes/adminRoutes')); // Admin features
app.use('/api/messages', require('./routes/messageRoutes')); // Messaging system
app.use('/api/stats', require('./routes/statsRoutes')); // Statistics for landing page
app.use('/api/users', require('./routes/userRoutes')); // User search and management
app.use('/api/assignments', require('./routes/vendorAssignmentRoutes')); // Vendor assignments

// Error Logger: Middleware to log errors and send standardized error responses
app.use(require('./utils/errorLogger'));

const PORT = process.env.PORT || 5000; // Define the port (default to 5000)

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
