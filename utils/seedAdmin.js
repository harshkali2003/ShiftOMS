const bcrypt = require("bcrypt");
const User = require("../modules/users/user.model")

const seedFirstAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "ADMIN" });

    if (adminExists) {
      console.log("✔ Admin user already exists. Skipping initialization.");
      return;
    }

    console.log("⚡ No admin found. Initializing first super admin account...");

    const { FIRST_ADMIN_NAME, FIRST_ADMIN_EMAIL, FIRST_ADMIN_PHONE, FIRST_ADMIN_PASSWORD } = process.env;
    if (!FIRST_ADMIN_EMAIL || !FIRST_ADMIN_PASSWORD) {
      console.error("❌ Admin seeding failed: Missing admin credentials in environment variables.");
      return;
    }

    const hashedPassword = await bcrypt.hash(FIRST_ADMIN_PASSWORD, 10);

    await User.create({
      name: FIRST_ADMIN_NAME || "Admin",
      email: FIRST_ADMIN_EMAIL,
      phone_no: FIRST_ADMIN_PHONE || "0000000000",
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log(`🚀 Success: Initial admin account created with email: ${FIRST_ADMIN_EMAIL}`);
  } catch (error) {
    console.error("❌ Error seeding initial admin:", error.message);
  }
};

module.exports = seedFirstAdmin;