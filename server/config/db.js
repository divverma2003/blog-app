import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;
