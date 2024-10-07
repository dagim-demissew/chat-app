import User from "../models/user-model.js";
import bcrypt from "bcryptjs";
import generateToken from "../util/generateToken.js";
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPassword = await bcrypt.compare(password, user?.password || "");
    if (user && isPassword) {
      generateToken.generateTokenAndSetCookie(user._id, res);
      return res.status(200).json({
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        profilePic: user.profilePic,
      });
    }
    return res.status(400).json({ error: "invalid credentials" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const logout = async (req, res, next) => {
  try {
    res
      .cookie("jwt", "", { maxAge: 0 })
      .status(200)
      .json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const register = async (req, res, next) => {
  const { fullname, username, password, confirmPassword, gender } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "passwords dont match" });
    }
    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ error: "username already taken" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // https://avatar.iran.liara.run/public
    const boyProfile = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfile = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = await User({
      fullname,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyProfile : girlProfile,
    });
    generateToken.generateTokenAndSetCookie(newUser._id, res);
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      username: newUser.username,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "internal server error, could not register user." });
  }
};

export default {
  login,
  logout,
  register,
};
