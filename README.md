# 🎫 Event Management & Ticketing API

A production-style **Event Management and Ticketing System REST API** built with **Node.js, Express, MongoDB, and Mongoose**.

This project demonstrates how to build a **real-world, scalable backend system** with:

- Authentication & Authorization (JWT)
- Role-based access control (Admin & User)
- Event management
- Ticket purchasing with inventory control
- Advanced API features (filtering, sorting, pagination, field limiting)
- Centralized error handling
- Clean architecture (controllers, services, middleware)

> This project is built as a portfolio project to demonstrate backend engineering skills and real-world API design.

---

## 🚀 Features

### 👤 Authentication & Authorization
- User registration & login
- JWT-based authentication
- Role-based access control (Admin / User)
- Protected routes

---

### 🎫 Event Management (Admin)
- Create events
- Update events
- Delete events
- Activate / close events
- Set ticket price, capacity, and event date

---

### 🛒 Ticket Booking (Users)
- Browse available events
- Buy tickets for events
- Prevent overbooking using ticket inventory control
- View own tickets
- Cancel tickets (if allowed)

---

### 🧠 Business Logic
- Tickets can only be purchased if:
  - Event is active
  - Tickets are still available
- Ticket purchase:
  - Reduces available ticket count
  - Creates a ticket record
  - Simulates payment flow
- Admin can:
  - View all ticket sales
  - Manage users
  - Close events

---

### ⚙️ Advanced API Features
- Filtering
- Sorting
- Pagination
- Field limiting

Example:
GET /api/events?price[lte]=5000&sort=price,date&page=1&limit=10&fields=title,price,date


---

## 🏗️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Express Rate Limit
- dotenv

---

## 📁 Project Structure

src/
├── controllers/
├── services/
├── models/
├── routes/
├── middlewares/
├── utils/
├── config/
├── app.js
└── server.js


---

## 📚 Data Models

### User
- name
- email
- password
- role (admin | user)
- isActive

### Event
- title
- description
- location
- date
- price
- capacity
- ticketsAvailable
- status (draft | active | closed)

### Ticket
- user
- event
- quantity
- totalPrice
- status (pending | paid | cancelled)

---

## 🔐 API Endpoints

### Auth
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me


### Events
POST /api/events (Admin)
PATCH /api/events/:id (Admin)
DELETE /api/events/:id (Admin)

GET /api/events (Public)
GET /api/events/:id (Public)


### Tickets
POST /api/tickets (User)
GET /api/tickets/me (User)
GET /api/tickets (Admin)
PATCH /api/tickets/:id/cancel

### Users (Admin)
GET /api/users
PATCH /api/users/:id/deactivate

## What This Project Demonstrates
- Real-world backend architecture
- Clean separation of concerns
- Secure authentication & authorization
- Business logic implementation
- Scalable API patterns
- Professional backend practices

## 👨‍💻 Author
**Olawale Olayinka**
Backend Developer (Laravel & Node.js)
