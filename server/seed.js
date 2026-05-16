require("dotenv").config();

const mongoose = require("mongoose");
const MenuItem = require("./models/MenuItem");
const menuItems = require("./seedData");

async function seedMenu() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bella-napoli";

  await mongoose.connect(mongoUri);

  for (const item of menuItems) {
    await MenuItem.findOneAndUpdate({ itemId: item.itemId }, item, {
      new: true,
      upsert: true,
      runValidators: true,
    });
  }

  console.log(`Seeded ${menuItems.length} menu items.`);
  await mongoose.disconnect();
}

seedMenu().catch(async (error) => {
  console.error("Menu seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
