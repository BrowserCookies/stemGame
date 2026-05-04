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

//== API endpoints ==//
server.get("/api/date", GetDateTime);
server.post("/db/set-user", SaveUser);
server.get("/db/get-user", GetUser);