const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      default: "Guest",
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must include at least one item.",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.items = ret.items.map((item) => ({
      id: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);
