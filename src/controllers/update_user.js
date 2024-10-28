import express from 'express';
import bcrypt from 'bcrypt';
import userSchema from '../schemas/userSchema.js';
import { collection } from '../config.js';
import { upload } from '../middleware/image_upload.js';
import { sendInternalServerError, sendInvalidRequestError, sendRegistrationSuccess } from '../helper_functions/helpers.js';
const updateUser = express.Router();


updateUser.put('/update-user', upload.single('profileImage'), async (req, res) => {
    const { name, fullName, email, username, password, phone, age, dateOfBirth, profileImage, gender } = req.body;

    if (!name && !fullName && !email && !username && !password && !phone && !age && !dateOfBirth && !gender) return sendBadRequestError(res, "All fields are required -name, fullName, email, username, password, phone, age, dateOfBirth, gender");
    try {
        const existUser = await collection.findOne({ email });
        if (!existUser) {
            return sendNotFoundError(res, "user not found, check the email");
        } 

            const { error } = userSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            // Prepare user data
            const userData = {
                name, fullName, email, username, password: hashedPassword, phone, age, dateOfBirth, profileImage, gender
            };
            // Insert new user
            await collection.updateOne({email}, {$set : userData});

            return sendRegistrationSuccess(res, "user data update successfully");

        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ message: 'Server error.' });
        }
    
});

export default updateUser;