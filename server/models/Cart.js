const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
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

const cartSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

cartSchema.set("toJSON", {
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

module.exports = mongoose.model("Cart", cartSchema);
