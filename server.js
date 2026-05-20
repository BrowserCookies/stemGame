import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

mongoose
  .connect(process.env.MDB_CONN)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
server.use(express.json());

server.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => {
  console.log(
    process.env.PRODUCTION == "n"
      ? `Dev server is running on http://localhost:${PORT}`
      : "Server started.",
  );
});

//== importing modules ==//
import GetDateTime from "./src/modules/get.date.time.js";
import SaveUser from "./src/modules/save.users.js";
import GetUser from "./src/modules/get.user.js";
import authRoutes from "./src/routes/auth.routes.js";
import courseRoutes from "./src/routes/course.routes.js";

//== API endpoints ==//
server.use("/api/auth", authRoutes);
server.use("/api/course", courseRoutes);

server.get("/api/date", GetDateTime);
server.post("/db/set-user", SaveUser);
server.get("/db/get-user", GetUser);

// Serve React single-page app for any other route
server.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
