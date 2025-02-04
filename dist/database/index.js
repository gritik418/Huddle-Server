import { connect } from "mongoose";
const mongoURI = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        const { connection } = await connect(mongoURI, {
            dbName: "Huddle",
        });
        console.log(`Mongo connected: ${connection.name}`);
    }
    catch (error) {
        console.log(`Mongo Error: ${error}`);
    }
};
export default connectDB;
