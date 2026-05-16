require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Cart = require("./models/Cart");
const MenuItem = require("./models/MenuItem");
const Order = require("./models/Order");

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bella-napoli";
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

async function normalizeCartItems(items = []) {
  const requestedItems = items
    .filter((item) => item && item.id && Number(item.quantity) > 0)
    .map((item) => ({ id: item.id, quantity: Number(item.quantity) }));
  const itemIds = [...new Set(requestedItems.map((item) => item.id))];
  const menuItems = await MenuItem.find({ itemId: { $in: itemIds }, available: true });
  const menuById = new Map(menuItems.map((item) => [item.itemId, item]));

  return requestedItems
    .filter((item) => menuById.has(item.id))
    .map((item) => {
      const menuItem = menuById.get(item.id);

      return {
        menuItemId: menuItem.itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      };
    });
}

function getOrderTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "offline" });
});

app.get("/api/menu", async (_req, res, next) => {
  try {
    const items = await MenuItem.find({ available: true }).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

app.post("/api/menu", async (req, res, next) => {
  try {
    const item = await MenuItem.create({
      itemId: req.body.id || req.body.itemId,
      category: req.body.category,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      badges: req.body.badges || [],
      available: req.body.available ?? true,
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

app.put("/api/menu/:id", async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { itemId: req.params.id },
      {
        category: req.body.category,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        badges: req.body.badges || [],
        available: req.body.available ?? true,
      },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/menu/:id", async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndDelete({ itemId: req.params.id });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    res.json({ message: "Menu item deleted.", item });
  } catch (error) {
    next(error);
  }
});

app.get("/api/cart/:sessionId", async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ sessionId: req.params.sessionId });
    res.json(cart || { sessionId: req.params.sessionId, items: [] });
  } catch (error) {
    next(error);
  }
});

app.put("/api/cart/:sessionId", async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { sessionId: req.params.sessionId, items: await normalizeCartItems(req.body.items) },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/cart/:sessionId", async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ sessionId: req.params.sessionId });
    res.json({ message: "Cart cleared.", sessionId: req.params.sessionId, items: [] });
  } catch (error) {
    next(error);
  }
});

app.get("/api/orders", async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders", async (req, res, next) => {
  try {
    const items = await normalizeCartItems(req.body.items);

    if (items.length === 0) {
      return res.status(400).json({ message: "Order must include at least one item." });
    }

    const order = await Order.create({
      customerName: req.body.customerName || "Guest",
      customerEmail: req.body.customerEmail || "",
      items,
      total: getOrderTotal(items),
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/orders/:id", async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/orders/:id", async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({ message: "Order deleted.", order });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = error.name === "ValidationError" ? 400 : 500;
  res.status(status).json({ message: error.message || "Server error." });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB.");
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
