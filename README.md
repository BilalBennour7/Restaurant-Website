# Bella Napoli Restaurant - Homework 4

Full-stack restaurant website using React, Vite, Bootstrap, Node.js, Express, and MongoDB.

The frontend now gets menu items from MongoDB, persists cart changes through the API, and saves checkout orders to the database.

## Run locally

```bash
npm install
npm run seed
npm run server
```

In a second terminal:

```bash
npm run dev
```

Create a `.env` file from `.env.example` before running the backend:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/bella-napoli
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

## REST API

- `GET /api/menu` - list menu items from MongoDB
- `POST /api/menu` - create a menu item
- `PUT /api/menu/:id` - update a menu item
- `DELETE /api/menu/:id` - delete a menu item
- `GET /api/cart/:sessionId` - load the current cart
- `PUT /api/cart/:sessionId` - persist cart updates
- `DELETE /api/cart/:sessionId` - clear a cart
- `GET /api/orders` - list saved orders
- `POST /api/orders` - save a checkout order
- `PATCH /api/orders/:id` - update order status
- `DELETE /api/orders/:id` - delete an order

## Video checklist

Record the browser side by side with MongoDB Compass or the Mongo shell. Show:

1. Menu items loading from the `menuitems` collection.
2. Adding, increasing, decreasing, and removing cart items updates the `carts` collection.
3. Checking out creates a document in the `orders` collection.
4. A menu CRUD operation through the API, such as adding or updating a menu item, appears in MongoDB and then on page refresh.

## Build

```bash
npm run build
```
