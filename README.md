# DevMate Backend

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

The backend service for DevMate - A Tinder-like platform for developers to connect, built with Node.js, Express, and MongoDB.

🔗 **Frontend Repository**: [DevMate Frontend](https://github.com/yourusername/devmate-frontend)

## Features

- 🔐 Secure authentication using JWT and OTP
- 📄 Feed page with developer profiles
- 🤝 Connection requests (send/accept/reject)
- 💬 1-to-1 and group chat using Socket.io
- 💳 Premium features with Razorpay integration
- 📧 AWS SES for email services
- ⏰ Daily cron job for pending requests reminder (8 PM)
- 🛠 Edit profile functionality

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcrypt
- **Payments**: Razorpay
- **Email**: AWS SES
- **WebSockets**: Socket.io
- **Scheduling**: node-cron

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
FROM_EMAIL=your_verified_ses_email
OTP_EXPIRY_MINUTES=10****
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devmate-backend.git
cd devmate-backend
```
2. Install dependencies and Start Development Server:
```bash
npm install
npm run dev
```
3.For production:
```bash
npm start
```

## Deployment
The application is deployed on AWS EC2 using:

Nginx as reverse proxy
PM2 for process management

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
