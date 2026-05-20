import mongoose from "mongoose";
import redis from "../clients/redis.js";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    ip_encrypted: {
      type: String,
    },
    updates: {
      type: Array,
      default: [],
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    authString: {
      type: String,
    },
    color: {
      type: String,
      default: "#000000",
    },
  },
  { collection: "users" },
);

UserSchema.post("save", async function (doc) {
  try {
    const obj = doc.toObject();
    delete obj.password;
    await redis.set(`user:${obj.authString}`, JSON.stringify(obj), {
      ex: 3600,
    });
    await redis.set(`userId:${obj._id}`, JSON.stringify(obj), { ex: 3600 });
  } catch (e) {
    console.warn("Failed to set user cache in post-save hook", e);
  }
});

UserSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;
  try {
    const obj = doc.toObject();
    delete obj.password;
    await redis.set(`user:${obj.authString}`, JSON.stringify(obj), {
      ex: 3600,
    });
    await redis.set(`userId:${obj._id}`, JSON.stringify(obj), { ex: 3600 });
  } catch (e) {
    console.warn("Failed to set user cache in post-findOneAndUpdate hook", e);
  }
});

UserSchema.post("remove", async function (doc) {
  try {
    if (!doc) return;
    await redis.del(`user:${doc.authString}`);
    await redis.del(`userId:${doc._id}`);
  } catch (e) {
    console.warn("Failed to remove user cache in post-remove hook", e);
  }
});

const User = mongoose.models.user || mongoose.model("user", UserSchema);
export default User;
