import mongoose from "mongoose";
import AutoIncrementFactory from 'mongoose-sequence';
import dotenv from 'dotenv';
dotenv.config();

const connectURL = process.env.mongourl || "mongodb://localhost:27017/user_ExpressDB";
mongoose.connect(connectURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected successfully to MongoDB');
}).catch((error) => {
    console.log('DB connection error:', error.message);
});

const AutoIncrement = AutoIncrementFactory(mongoose);
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    age: { type: Number, required: true },
    dateOfBirth: { type: Date, default: null },
    profileImage: { type: String, default: null },
    gender: { type: String, required: true },
    status: { type: String, enum: ['unverified', 'active', 'blocked'], default: 'unverified' },
});
userSchema.plugin(AutoIncrement, { inc_field: 'id' });

const collection = mongoose.model('user_details', userSchema);

export default collection;
