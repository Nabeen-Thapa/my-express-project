import Joi from 'joi';

// Define validation schema
const userSchema = Joi.object({
    name: Joi.string().min(3).required(),
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(), // Assuming a 10-digit phone number
    age: Joi.number().integer().min(13).max(120).required(), // Assuming minimum age is 13
    dateOfBirth: Joi.date().optional(),
    profileImage: Joi.string().optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required() // Assuming specific options
});

export default userSchema;
