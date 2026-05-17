import dns from "dns";
import mongoose from "mongoose";

// Use a public resolver for Atlas SRV lookups when the default DNS path fails.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        mongoose.connection.on("connected", () => console.log("MongoDB connected"));
        mongoose.connection.on("error", (error) => console.error("MongoDB connection error:", error));

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDB;