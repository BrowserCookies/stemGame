import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import requestIp from "request-ip";
import redis from "../clients/redis.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username, email, and password." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists." });
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

    // Cache sanitized user by authString for legacy lookups
    try {
      const publicUser = newUser.toObject();
      delete publicUser.password;
      // keep authString in cache for legacy endpoints
      await redis.set(
        `user:${publicUser.authString}`,
        JSON.stringify(publicUser),
        { ex: 3600 },
      );
      await redis.set(`userId:${publicUser._id}`, JSON.stringify(publicUser), {
        ex: 3600,
      });
    } catch (e) {
      console.warn("Failed to set user cache on register", e);
    }

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
      return res
        .status(400)
        .json({ message: "Please provide username/email and password." });
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
    const token = jwt.sign({ id: user._id, username: user.username }, secret, {
      expiresIn: "24h",
    });
    // Update cache with sanitized user including authString for legacy endpoints
    try {
      const publicUser = user.toObject
        ? user.toObject()
        : {
            id: user._id,
            username: user.username,
            email: user.email,
            color: user.color,
          };
      delete publicUser.password;
      await redis.set(
        `user:${publicUser.authString}`,
        JSON.stringify(publicUser),
        { ex: 3600 },
      );
      await redis.set(`userId:${publicUser._id}`, JSON.stringify(publicUser), {
        ex: 3600,
      });
    } catch (e) {
      console.warn("Failed to set user cache on login", e);
    }

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
    // Try cache first
    const cached = await redis.get(`userId:${req.user.id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // return sanitized version without sensitive fields
        delete parsed.password;
        delete parsed.ip_encrypted;
        const resp = { ...parsed };
        delete resp.authString;
        return res.json(resp);
      } catch (e) {
        console.warn(
          "Failed to parse cached user in me endpoint, falling back to DB",
          e,
        );
      }
    }

    // DB fallback and update cache
    const user = await User.findById(req.user.id).select(
      "-password -ip_encrypted",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    try {
      const publicForCache = user.toObject();
      // keep authString in cache for legacy endpoints
      delete publicForCache.password;
      await redis.set(
        `user:${publicForCache.authString}`,
        JSON.stringify(publicForCache),
        { ex: 3600 },
      );
      await redis.set(
        `userId:${publicForCache._id}`,
        JSON.stringify(publicForCache),
        { ex: 3600 },
      );
    } catch (e) {
      console.warn("Failed to set user cache in me endpoint", e);
    }

    // Return sanitized user without authString
    const responseUser = user.toObject();
    delete responseUser.password;
    delete responseUser.ip_encrypted;
    delete responseUser.authString;
    res.json(responseUser);
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
