import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import GetDateTime from "./src/modules/get.date.time.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
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

server.get("/api/date", GetDateTime);
 