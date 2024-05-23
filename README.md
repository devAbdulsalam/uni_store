# Automated University Store System

This is an Automated University Store System built with Node.js, Express, and PostgreSQL. The system includes user management, store management, order processing, and reporting functionalities.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Running the Application](#running-the-application)
- [License](#license)

## Features

### User Management

- **Registration**: Users can register with a username, password, email, and role (student, staff, admin).
- **Login**: Users can log in with a username and password.
- **Password Recovery**: Users can recover their password via email.

### Store Management

- **Product Catalog**: View all products with details like name, description, price, and quantity.
- **Inventory Management**: Manage product inventory and check product quantities.

### Order Processing

- **Order Creation**: Users can place orders for products.
- **Order Confirmation**: Users receive order confirmation notifications.

### Reporting and Analytics

- **Sales Reports**: Generate sales reports by date with total sales.
- **Inventory Reports**: Generate inventory reports for product quantities.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/university-store.git
   cd university-store
   ```
   Sure, here is a README file for the Automated University Store System application:

````markdown
# Automated University Store System

This is an Automated University Store System built with Node.js, Express, and PostgreSQL. The system includes user management, store management, order processing, and reporting functionalities.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Running the Application](#running-the-application)
- [License](#license)

## Features

### User Management

- **Registration**: Users can register with a username, password, email, and role (student, staff, admin).
- **Login**: Users can log in with a username and password.
- **Password Recovery**: Users can recover their password via email.

### Store Management

- **Product Catalog**: View all products with details like name, description, price, and quantity.
- **Inventory Management**: Manage product inventory and check product quantities.

### Order Processing

- **Order Creation**: Users can place orders for products.
- **Order Confirmation**: Users receive order confirmation notifications.

### Reporting and Analytics

- **Sales Reports**: Generate sales reports by date with total sales.
- **Inventory Reports**: Generate inventory reports for product quantities.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/university-store.git
   cd university-store
   ```
````

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Database Setup

1. **Create the PostgreSQL database**:

   ```sql
   CREATE DATABASE university_store;
   \c university_store

   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(255) NOT NULL,
     password VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     role VARCHAR(50) NOT NULL
   );

   CREATE TABLE products (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     price FLOAT NOT NULL,
     quantity INTEGER NOT NULL
   );

   CREATE TABLE orders (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id),
     product_id INTEGER REFERENCES products(id),
     quantity INTEGER NOT NULL,
     total FLOAT NOT NULL,
     order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE inventory (
     product_id INTEGER PRIMARY KEY REFERENCES products(id),
     quantity INTEGER NOT NULL
   );
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/university_store
JWT_SECRET=your_jwt_secret_key
```

## API Endpoints

### User Management

- **Register**: `POST /users`
  - Data: `{ "username": "string", "password": "string", "email": "string", "role": "string" }`
- **Login**: `POST /login`
  - Data: `{ "username": "string", "password": "string" }`
- **Password Recovery**: `POST /password-recovery`
  - Data: `{ "email": "string" }`

### Store Management

- **Get Products**: `GET /products`
- **Get Inventory**: `GET /inventory`

### Order Processing

- **Create Order**: `POST /orders`
  - Data: `{ "user_id": "integer", "product_id": "integer", "quantity": "integer", "total": "float" }`

### Reporting and Analytics

- **Get Sales Reports**: `GET /sales-reports`
- **Get Inventory Reports**: `GET /inventory-reports`

## Running the Application

1. **Start the application**:
   ```bash
   npm run dev
   ```

The server will start on port 3000 by default. You can change the port by setting the `PORT` environment variable in the `.env` file.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

```

This README file includes a detailed description of the project, its features, installation steps, database setup instructions, API endpoints, and how to run the application. Adjust the GitHub repository link and other specific details as needed.
```
