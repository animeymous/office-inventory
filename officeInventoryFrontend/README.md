# Office Inventory Management System

A full-stack application for managing office supply purchase requests. Creators can raise orders, and Purchasers can approve/reject them.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Role-Based Access Control](#role-based-access-control)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Orders (Creator)](#orders-creator)
  - [Orders (Purchaser)](#orders-purchaser)
  - [Admin/Internal APIs](#admininternal-apis)
- [Business Rules](#business-rules)
- [Dark Mode Support](#dark-mode-support)
- [Troubleshooting](#troubleshooting)

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.x
- Spring Security with JWT
- Spring Data JPA
- H2 Database (In-memory)

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Toastify

## Features

### For Creators
- Register new account
- Login with JWT authentication
- Create new orders with multiple items
- Save orders as draft
- Edit draft orders (only their own)
- Submit orders for approval
- View only their own orders
- View order details
- Change password

### For Purchasers
- Login with JWT authentication
- **View ALL orders** (Submitted, Completed, Rejected from ALL creators)
- Approve orders with transaction reference
- Reject orders with rejection note
- View order details for ANY order
- Change password
- Create additional purchaser accounts (via Postman API only)

## Role-Based Access Control

### 🔐 Creator Access Rights

| Action | Access Level | Description |
|--------|-------------|-------------|
| View Orders | **Own orders only** | Can only see orders they created |
| Create Order | ✅ Yes | Can create new draft/submitted orders |
| Edit Order | **Own drafts only** | Can only edit their own DRAFT orders |
| Submit Order | **Own drafts only** | Can only submit their own DRAFT orders |
| View Order Details | **Own orders only** | Can only see details of orders they created |
| Change Password | ✅ Yes | Can change their own password |
| Delete Order | ❌ No | Not allowed |
| View Others' Orders | ❌ No | Cannot see orders created by other creators |
| Approve/Reject Orders | ❌ No | Only purchasers can perform these actions |

### 🔒 Purchaser Access Rights

| Action | Access Level | Description |
|--------|-------------|-------------|
| View Orders | **ALL orders** | Can see orders from ALL creators |
| View Order Details | **ALL orders** | Can see details of ANY order |
| Approve Orders | **Submitted only** | Can approve any SUBMITTED order |
| Reject Orders | **Submitted only** | Can reject any SUBMITTED order |
| Change Password | ✅ Yes | Can change their own password |
| Create Purchaser | ✅ Yes (API only) | Can create new purchaser accounts via Postman |
| Edit Orders | ❌ No | Cannot edit any orders |
| Delete Orders | ❌ No | Cannot delete orders |

### 📊 Visibility Matrix

| User Role | Can See Creator A's Orders | Can See Creator B's Orders | Can See Creator C's Orders |
|-----------|---------------------------|---------------------------|---------------------------|
| Creator A | ✅ Yes (own orders) | ❌ No | ❌ No |
| Creator B | ❌ No | ✅ Yes (own orders) | ❌ No |
| Creator C | ❌ No | ❌ No | ✅ Yes (own orders) |
| Purchaser 1 | ✅ Yes | ✅ Yes | ✅ Yes |
| Purchaser 2 | ✅ Yes | ✅ Yes | ✅ Yes |

### 🎯 Action Permissions by Role

| Action | Creator | Purchaser |
|--------|---------|-----------|
| Create Draft Order | ✅ | ❌ |
| Edit Draft Order | ✅ (own only) | ❌ |
| Submit Order | ✅ (own only) | ❌ |
| View Order List | ✅ (own only) | ✅ (all) |
| View Order Details | ✅ (own only) | ✅ (all) |
| Approve Order | ❌ | ✅ |
| Reject Order | ❌ | ✅ |
| Change Password | ✅ | ✅ |
| Create Purchaser | ❌ | ✅ (API only) |

### 🔄 Order Status Visibility

| Order Status | Creator Can See | Purchaser Can See |
|--------------|-----------------|-------------------|
| DRAFT | ✅ (own only) | ✅ (all - for monitoring) |
| SUBMITTED | ✅ (own only) | ✅ (all - for approval) |
| COMPLETED | ✅ (own only) | ✅ (all - for audit) |
| REJECTED | ✅ (own only) | ✅ (all - for audit) |

### 💡 Why This Design?

1. **Creator Privacy**: Creators should only see and manage their own purchase requests
2. **Centralized Approval**: Any purchaser can process any order (first-come, first-serve)
3. **Audit Trail**: Purchasers need visibility into all orders for reporting
4. **No Order Assignment**: No need to assign orders to specific purchasers
5. **Efficiency**: Any available purchaser can approve pending orders

## Project Structure