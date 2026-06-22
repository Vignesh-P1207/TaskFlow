const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // sets secure HTTP headers
app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN || "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")); // request logging

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api", routes);

// 404 for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Must be registered last — catches everything thrown/forwarded via next(err)
app.use(errorHandler);

module.exports = app;
