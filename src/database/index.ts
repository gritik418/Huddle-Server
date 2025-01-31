import { connect } from "mongoose";

const connectDB = async () => {
  try {
    const {} = connect();
  } catch (error) {}
};
