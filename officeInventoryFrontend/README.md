# Office Inventory Management System

A full-stack application for managing office supply purchase requests. Creators can raise orders, and Purchasers can approve/reject them.

## 📚 Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Security Implementation](#security-implementation)
- [Role-Based Access Control](#role-based-access-control)
- [Quick Start Guide](#quick-start-guide)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)
- [Business Rules](#business-rules)
- [Dark Mode Support](#dark-mode-support)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

## 🛠️ Tech Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.x** - Framework for building REST APIs
- **Spring Security with JWT** - Authentication & Authorization
- **Spring Data JPA** - Database operations
- **H2 Database** - In-memory database (no installation needed)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router DOM** - Navigation between pages
- **Axios** - HTTP requests to backend
- **React Toastify** - Notification popups

## ✨ Features

### For Creators (Office Admins)
- Register new account
- Login with secure JWT authentication
- Create new orders with multiple items
- Save orders as draft (edit later)
- Edit only their own draft orders
- Submit orders for approval
- View ONLY their own orders (can't see other creators' orders)
- View order details
- Change password

### For Purchasers (Managers)
- Login with JWT authentication
- **View ALL orders** from ALL creators
- Approve orders with transaction reference (e.g., PO-2026-001)
- Reject orders with rejection note
- View order details for ANY order
- Change password

### Business Constraints
- ❌ No two SUBMITTED orders can contain the same items
- ✅ Draft orders CAN have overlapping items
- ✅ Only the creator can edit their draft orders
- ❌ Submitted orders cannot be edited

### UI/UX Features
- 🌞 Dark/Light mode toggle (remembers your preference)
- 📱 Fully responsive (works on mobile, tablet, desktop)
- 🎨 Modern gradient backgrounds and card designs
- ⚡ Real-time password strength indicator
- 🔔 Toast notifications for all actions

## 🔐 Security Implementation

### How Authentication Works (Important!)

**Instead of storing tokens in localStorage (which is vulnerable to XSS attacks), we use HttpOnly Cookies.**

| Storage Method | Can JavaScript access it? | Security Level |
|----------------|--------------------------|----------------|
| localStorage | ✅ YES (vulnerable to XSS) | ⚠️ Low |
| HttpOnly Cookie | ❌ NO (JS cannot access) | ✅ High |

**What this means for you as a developer:**
- You don't need to manually add Authorization headers
- The browser automatically sends the token cookie with every request
- You can't see or modify the token from JavaScript (more secure)

### How to Create Purchaser Accounts (Internal API)

**⚠️ IMPORTANT: There is NO button or form in the UI to create purchasers!**

This is intentional for security. Only reviewers/admins can create purchaser accounts using Postman.

**Why no UI?**
- Prevents regular users from creating purchaser accounts
- Reduces security risks
- Internal tool design pattern

**To create a purchaser (via Postman only):**

```bash
curl -X POST http://localhost:8081/api/auth/create-purchaser \
-H "Content-Type: application/json" \
-H "X-Admin-Secret: reviewer123" \
-d '{
  "username": "purchaser2",
  "password": "password123",
  "fullName": "Second Purchaser"
}'