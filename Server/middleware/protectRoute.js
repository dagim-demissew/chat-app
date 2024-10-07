import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import mongoose from "mongoose";
const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized access no token!" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Unauthorized access invalid token!" });
    }
    // Convert the string ID to a Mongoose ObjectId
    const userId = decoded.userId;

    // Find the user by the converted ObjectId
    const user = await User.findById(userId).select("-password");
console.log(user)
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

export default protectRoute;
