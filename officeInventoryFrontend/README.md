# Office Inventory Management System

A full-stack application for managing office supply purchase requests. Creators can raise orders, and Purchasers can approve/reject them.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)
- [Business Rules](#business-rules)
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
- Edit draft orders
- Submit orders for approval
- View all personal orders
- View order details
- Change password

### For Purchasers
- Login with JWT authentication
- View all submitted orders
- Approve orders with transaction reference
- Reject orders with rejection note
- View order details
- Change password

### Business Constraints
- No two submitted orders can contain the same items
- Draft orders can have overlapping items
- Only the creator can edit their draft orders
- Submitted orders cannot be edited

## Project Structure
