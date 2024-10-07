import User from "../models/user-model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import generateToken from "../util/generateToken.js";
import Conversation from "../models/conversation-model.js";
import Message from "../models/message-model.js";
import { io } from "../socket/socket.js";
import { getReceiverSocketId } from "../socket/socket.js";
const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const senderId = req.user._id;
    console.log(id);
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, id] },
    }).populate("messages"); //gives back messages it self not the references
    if (!conversation) {
      return res.status(200).json([]);
    }
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
};
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const { id } = req.params;
    const senderId = req.user._id;
    const reciverId = id;
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, reciverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, reciverId],
      });
    }
    const newMessage = new Message({
      senderId,
      reciverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    await Promise.all([conversation.save(), newMessage.save()]);
    //socket io functionality
    const reciverSocketId = getReceiverSocketId(reciverId);
    if (reciverSocketId) {
      //to() is used to send events to a specific client
      io.to(reciverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  sendMessage,
  getMessages,
};
