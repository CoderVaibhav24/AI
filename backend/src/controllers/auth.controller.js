import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamClient, generateStreamToken } from "../lib/stream.js";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const indx = Math.floor(Math.random() * 100) + 1;
    const profilePicture = `https://avatar.iran.liara.run/public/${indx}.png`;

    const newUser = new User({
      fullName,
      email,
      password,
      profilePicture,
    });

    try {
      await upsertStreamClient({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePicture || "",
      });
      console.log(`Stream client created successfully for user: ${newUser.fullName}`);
    } catch (error) {
      console.error("Error creating Stream client:", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await newUser.save();

    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try{
    const userId = req.user._id;
    const {fullName, bio, nativeLanguage, learningLanguage, location} = req.body;

    if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
      return res.status(400).json({ 
        message: "All fields are required" ,
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ],
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      ...req.body,
      isOnboarded: true,
    }, { new: true });

    if(!updatedUser){
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      await upsertStreamClient({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePicture || "",
      });
      console.log(`Stream client updated successfully for user: ${updatedUser.fullName}`);
    } catch (error) {
      console.error("Error updating Stream client:", error);
    }

    res.status(200).json({
      success: true,
      message: "User onboarded successfully",
    });

  }catch(error){
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}