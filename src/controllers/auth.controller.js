import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import requestIp from "request-ip";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide username, email, and password." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Keep backwards compatibility for authString and colors
    const authStringOrigin = `${username}@${hashedPassword}`;
    const authString = bcrypt.hashSync(authStringOrigin, 10);
    const colorsArr = [
      "#ff9800",
      "#4caf50",
      "#2196f3",
      "#9c27b0",
      "#f44336",
      "#3f51b5",
    ];

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      authString: authString,
      ip_encrypted: await bcrypt.hash(requestIp.getClientIp(req), 10),
      color: colorsArr[Math.floor(Math.random() * colorsArr.length)],
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be username or email

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide username/email and password." });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || "default_secret_key";
    const token = jwt.sign(
      { id: user._id, username: user.username },
      secret,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        color: user.color,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const me = async (req, res) => {
  try {
    // req.user is set by the auth.middleware.js
    const user = await User.findById(req.user.id).select("-password -ip_encrypted -authString");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
