import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI);
    console.log("DataBase Connected");
  } catch (error) {
    console.log(error);
  }
};

export default connectToDB;
