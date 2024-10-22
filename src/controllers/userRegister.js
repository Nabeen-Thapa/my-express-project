// controllers/userRegister.js
import express from 'express';
import bcrypt from 'bcrypt';
import userSchema from '../schemas/userSchema.js'; // Adjust the path as necessary
import { collection } from '../config.js';
import { upload } from '../middleware/image_upload.js';

const registeRouter = express.Router();
const saltRounds = 10;

registeRouter.post('/', upload.single('profileImage'), async (req, res) => {
    try {
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const userData = {
            name: req.body.name,
            fullName: req.body.fullName,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            phone: req.body.phone,
            age: req.body.age,
            dateOfBirth: req.body.dateOfBirth,
            profileImage: req.file ? req.file.path : null,
            gender: req.body.gender
        };

        const existingUser = await collection.findOne({
            $or: [
                { email: req.body.email },
                { phone: req.body.phone },
                { username: req.body.username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        await collection.insertMany(userData); // Insert the new user data
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
    console.error('Registration error:', err); // Log the detailed error
    res.status(500).json({ message: 'Server error.' });
}
});

export default registeRouter;
