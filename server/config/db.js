import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        mongoose.connection.on("connected", () => console.log("MongoDB connected"));
        mongoose.connection.on("error", (error) => console.error("MongoDB connection error:", error));

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            family: 4, // Force IPv4
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDB;