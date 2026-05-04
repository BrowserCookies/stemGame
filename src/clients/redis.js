import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();

const redis = Redis.fromEnv();

export default redis;
