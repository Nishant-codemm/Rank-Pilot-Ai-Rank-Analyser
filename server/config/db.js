import dns from "dns";
import mongoose from "mongoose";

// Force Google's public DNS for Atlas SRV lookups — local ISP DNS may block these records
dns.setDefaultResultOrder("ipv4first");
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
            serverSelectionTimeoutMS: 15000,
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDB;