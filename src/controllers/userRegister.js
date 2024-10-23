import express from 'express';
import bcrypt from 'bcrypt';
import userSchema from '../schemas/userSchema.js'; 
import { collection } from '../config.js';
import { upload } from '../middleware/image_upload.js';

const registeRouter = express.Router();
const saltRounds = 10;

registeRouter.post('/', upload.single('profileImage'), async (req, res) => {
    console.log('Request body:', req.body); //
    
    try {
        // Validate input against schema
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        // Prepare user data
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
            gender: req.body.gender,
        };

        // Check for existing user
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

        // Insert new user
        await collection.create(userData);

        res.status(201).json({ message: 'User registered successfully.' });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});


export default registeRouter;
