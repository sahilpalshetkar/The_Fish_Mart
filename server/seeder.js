import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import User from "./models/user.model.js";

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await User.create({
        fullName: "Sahil Palshetkar",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        mobile: process.env.ADMIN_MOBILE,
        role: "admin",
      });

      console.log("✅ Admin created");
    } else {
      console.log("⚠️ Admin already exists");
    }

    // Check if delivery boy already exists
    const existingDeliveryBoy = await User.findOne({
      email: process.env.DELIVERY_EMAIL,
    });

    if (!existingDeliveryBoy) {
      const hashedPassword = await bcrypt.hash(
        process.env.DELIVERY_PASSWORD,
        10,
      );

      await User.create({
        fullName: "sahil delivery boy",
        email: process.env.DELIVERY_EMAIL,
        password: hashedPassword,
        mobile: process.env.DELIVERY_MOBILE,
        role: "deliveryBoy",
      });

      console.log("✅ Delivery boy created");
    } else {
      console.log("⚠️ Delivery boy already exists");
    }

    console.log("🌱 Seeding completed");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedUsers();
