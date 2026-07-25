const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: true,
  }),
);

const connectDB = require("./config/db.config");
const seedAdmin = require("./utils/seedAdmin")

const User = require("./modules/users/user.route");
const Product = require("./modules/products/products.model");
const Order = require("./modules/orders/orders.route");

app.use("/user", User);
app.use("/product", Product);
app.use("/order", Order);

app.use((err, req, res, next) => {
  console.error("ALERT 🚨:", err.stack); // This prints the exact error line to your terminal console

  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong on the server",
  });
});


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error.message);
    process.exit(1);
  }
};

startServer();