
  🔥 DevMate Backend
  A Tinder-like platform for developers to connect and collaborate.
  
    
  
  
    
  


Overview
DevMate is a networking platform designed for developers to connect, collaborate, and build projects together. This repository contains the backend implementation, powered by Node.js, Express, and MongoDB, with secure authentication, real-time chat, and premium features.
Features

🔒 Secure Authentication: JWT-based auth with OTP verification.
📡 User Feed: Display profiles of other developers.
🤝 Connection Requests: Send, accept, or reject join requests.
💬 Real-time Chat: 1-to-1 and group chat with Socket.IO.
💳 Premium Features: Razorpay integration for subscriptions.
✏️ Profile Management: Edit profiles and logout functionality.
📧 Email Notifications: AWS SES for email services.
⏰ Scheduled Tasks: Daily cron job at 8 PM for pending request notifications.
🚀 Deployment: Hosted on AWS EC2 with Nginx and PM2.

Tech Stack

Node.js & Express: Backend framework
MongoDB & Mongoose: Database and ORM
JWT & Bcrypt: Authentication
Socket.IO: Real-time communication
Razorpay: Payment gateway
AWS SES: Email service
Node-cron: Task scheduling

Dependencies:
{
  "@aws-sdk/client-ses": "^3.730.0",
  "bcrypt": "^5.1.1",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "date-fns": "^4.1.0",
  "dotenv": "^16.4.7",
  "express": "^4.21.1",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.8.0",
  "node-cron": "^3.0.3",
  "nodemon": "^3.1.7",
  "razorpay": "^2.9.5",
  "socket.io": "^4.8.1",
  "validator": "^13.12.0"
}

Prerequisites

Node.js (v18 or higher)
MongoDB (local or cloud instance)
AWS account with SES configured
Razorpay account for payments
Environment variables (see .env.example)

Setup and Installation

Clone the Repository:
git clone https://github.com/your-username/devmate-backend.git
cd devmate-backend


Install Dependencies:
npm install


Configure Environment Variables:Create a .env file in the root directory:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
SES_SENDER_EMAIL=your_verified_ses_email


Run the Application:

Development (with nodemon):npm run dev


Production:npm start




Access the API:The server runs on http://localhost:5000 (or your specified PORT).


Deployment

Deployed on AWS EC2 with Nginx as a reverse proxy and PM2 for process management.
Ensure MongoDB, AWS SES, and Razorpay are configured in the production environment.

Related Repository

🌐 DevMate Frontend

Contributing
We welcome contributions! Please open an issue or submit a pull request.
License
Licensed under the ISC License.

  Built with 💻 by Agrim Gupta
