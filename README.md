# FreelancingPortal – Freelance Marketplace & Bidding Platform

FreelancingPortal is a full-stack freelance marketplace and bidding platform built using the MERN stack.

The platform connects Clients and Developers through project posting, competitive bidding, hiring, project assignment, and project completion workflows.

## Technology Stack

- React.js
- Node.js
- Express.js
- MongoDB
- JWT
- bcrypt

## Project Roles

- Admin
- Client
- Developer

## About The Project

FreelancingPortal is designed to provide a complete digital marketplace for freelance work.

Clients can create and publish projects, receive competitive bids from Developers, review proposals, and hire suitable Developers.

Developers can discover available projects, submit bids using tokens, track their bids, and work on assigned projects.

Admins can manage users, monitor projects, moderate platform activities, and handle account-related actions.

## Authentication & User Roles

FreelancingPortal uses secure token-based authentication with JWT.

The platform supports three different user roles:

- **Admin** – Manages users, projects, moderation, and platform activities.
- **Client** – Creates projects, receives bids, reviews developers, and hires developers.
- **Developer** – Browses projects, submits bids, manages bids, and works on assigned projects.

### Authentication Features

- JWT-based authentication
- Secure password hashing using bcrypt
- Role-Based Access Control (RBAC)
- Protected REST API routes
- Role-specific workflows for Admin, Client, and Developer

## Client Features

- Create and publish freelance projects
- Define project requirements and details
- View competitive bids from Developers
- Review developer proposals and bid details
- Hire a suitable Developer
- Assign projects to selected Developers
- Track project progress and completion
- Receive real-time notifications for project and bidding activities

## Developer Features

- Browse available freelance projects
- View project requirements and details
- Submit competitive bids using tokens
- Track submitted bids
- Receive bid status notifications
- Get notified when a bid is accepted or rejected
- View assigned projects
- Work on assigned projects
- Complete assigned projects
- Manage available bidding tokens

## Admin Features

- Manage registered users
- Monitor Client and Developer accounts
- Moderate platform activities
- Manage project-related activities
- Block or manage user accounts
- Receive notifications for account-related actions
- Maintain platform security and access control
- Manage the overall freelance marketplace

## Token-Based Bidding System

FreelancingPortal uses a token-based bidding system to manage competitive project bids.

- Developers use tokens to submit bids on projects.
- Token balance is validated before placing a bid.
- MongoDB atomic `$inc` operations are used for token balance updates.
- Atomic operations help prevent incorrect token deductions during simultaneous bid submissions.
- The system maintains consistent token balances even when multiple users submit bids concurrently.

## Concurrency-Safe Bid Acceptance

FreelancingPortal uses concurrency-safe logic when a Client accepts a Developer bid.

- Conditional `findOneAndUpdate` queries are used during bid acceptance.
- The project is assigned to only one Developer.
- Once a bid is accepted, other pending bids are automatically rejected.
- Conditional database updates help prevent multiple Developers from being assigned to the same project during simultaneous requests.
- This ensures consistent project and bidding state under concurrent operations.

## Real-Time Notifications

FreelancingPortal provides in-app notifications to keep users updated about important platform activities.

The system supports notifications for the following events:

1. Bid Received
2. Bid Accepted
3. Bid Rejected
4. Project Assigned
5. Account Blocked

These notifications help Clients, Developers, and Admins stay informed about important changes without manually checking every section of the platform.

## Wallet & Token Package System

FreelancingPortal provides a token-based wallet system for Developers.

- Developers can maintain a token balance in their wallet.
- Tokens are required to submit project bids.
- Token balance is validated before placing a bid.
- Developers can purchase token packages to increase their available bidding balance.
- Token transactions are handled through backend validation and database operations.
- The wallet system supports the platform's competitive bidding workflow.


## Security Features

FreelancingPortal implements multiple security mechanisms to protect user accounts, APIs, and platform workflows.

- JWT-based authentication for protected routes
- bcrypt password hashing
- Role-Based Access Control (RBAC)
- Protected Admin, Client, and Developer workflows
- Authenticated REST API endpoints
- Token balance validation before bidding
- Atomic MongoDB operations for safe token updates
- Conditional database updates for concurrency-safe bid acceptance
- User account blocking and moderation through Admin controls

## Technologies & API Architecture

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Bootstrap

### Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt

### Database

- MongoDB
- Mongoose

### Development Tools

- Git
- GitHub
- Postman
- Visual Studio Code

## REST API Architecture

FreelancingPortal provides **20+ REST API endpoints** for different platform workflows.

The APIs are secured using:

- JWT authentication
- bcrypt password hashing
- Role-Based Access Control (RBAC)

The API architecture supports Admin, Client, and Developer operations including authentication, projects, bidding, wallet management, notifications, and user management.

## Project Architecture

FreelancingPortal follows a separate frontend and backend architecture.

### Frontend

The frontend is developed using React.js and is responsible for:

- User interface
- Client dashboard
- Developer dashboard
- Admin dashboard
- Project management
- Bidding interface
- Wallet and token management
- Notifications

### Backend

The backend is developed using Node.js and Express.js and is responsible for:

- Authentication and authorization
- User management
- Project management
- Bid management
- Token transactions
- Wallet operations
- Notifications
- Admin operations

### Database

MongoDB is used to store:

- User information
- Project details
- Bids
- Token balances
- Notifications
- Other platform-related data


## Installation & Setup

```bash
git clone <repository-url>
cd FreelancingPortal


## Project Owner & Designer

Er. Deepak Yadav
Full Stack Developer | MERN Stack Developer | IT