# EventEmpire 🏰

> **The Ultimate Event Management Platform connecting Event Planners with Top-Tier Vendors.**

EventEmpire is a full-stack MERN application designed to streamline the entire event planning lifecycle. From creating events and managing budgets to hiring vendors and tracking RSVPs, EventEmpire handles it all with a sleek, role-based interface.

---

## 📚 Documentation

For detailed guides, please refer to:

*   **📖 [Complete Project Walkthrough](./PROJECT_WALKTHROUGH.md)**  
    *Step-by-step guide on Setup, Installation, and how to use every feature.*
*   **⚙️ [Technical Documentation](./project_documentation.md)**  
*   **Job Management**: Receive job requests, Accept/Decline, and track job status (`Pending` -> `In Progress` -> `Completed`).
*   **Payments**: Track earnings and payment status.

### 🛡️ For Administrators
*   **User Management**: View, Block, or Soft Delete users and vendors.
*   **System Logs**: Monitor OTP generation and system errors for security.
*   **Global Stats**: View real-time platform statistics.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js, Bootstrap 5, Context API
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: JWT (JSON Web Tokens) + 2FA (OTP)
*   **Services**:
    *   **Nodemailer**: For sending invitations and OTPs.
    *   **Multer**: For handling image uploads.
    *   **Bcrypt**: For secure password hashing.

---

## 🚀 Quick Start

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    ```
2.  **Install Dependencies**:
    ```bash
    npm install  # Installs both server and client dependencies
    ```
3.  **Setup Environment**:
    Create a `.env` file in `server/` (see `PROJECT_WALKTHROUGH.md` for details).
4.  **Run the App**:
    ```bash
    npm run dev
    ```
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:5000`

---

## 📂 Project Structure

```
EventEmpire/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Application Views
│   │   └── context/        # Global State (Auth)
├── server/                 # Express Backend
│   ├── models/             # Database Access Layer
│   ├── routes/             # API Endpoints
│   ├── services/           # Business Logic
│   └── utils/              # Schemas & Helpers
├── PROJECT_WALKTHROUGH.md  # User Guide
└── project_documentation.md # Technical Guide
```

---

*Built with ❤️ by the EventEmpire Team*
