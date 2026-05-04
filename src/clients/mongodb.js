import mongoose from "mongoose";
import dotenv from "dotenv";

mongoose
  .connect(process.env.MDB_CONN)
  .then(() => {
    export default mongoose;
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
