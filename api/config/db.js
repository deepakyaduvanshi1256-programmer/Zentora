import mongoose from "mongoose";

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/zentora");
        console.log("database connection succesfully");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    }
}

export default dbconnect