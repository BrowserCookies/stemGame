import mongoose from "mongoose";
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

const User = mongoose.model("user", UserSchema);
export default User;
