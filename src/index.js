import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from './middleware/image_upload.js';
import collection from './config.js';
import bcrypt from 'bcrypt';
import loginRouter from './routers/login_route.js'; // Correct relative path
import { logUserDetails } from './utils/logger.js'; // Import the logging utility
import logger from './utils/logger.js'
import { 
    sendUserExistsError, 
    sendInvalidRequestError, 
    sendInternalServerError, 
    sendRegistrationSuccess, 
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendLogoutSuccess
} from './helper_functions/helpers.js'; // Import helper functions

import Joi from 'joi';

// import validation schema 
import userSchema from './schemas/userSchema.js'; // Adjust the path if necessary

const app = express();
//to store image in cloudinary
app.post('/upload', upload.single('profileImage'), (req, res) => {
    try {
        // req.file now contains Cloudinary details, including the URL of the uploaded image
        const imageUrl = req.file.path; // Cloudinary stores the uploaded image's URL in req.file.path
        res.json({ imageUrl: imageUrl, message: 'Image uploaded successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
});



const saltRounds = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', upload.single('profileImage'), async (req, res) => {
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
            dateOfBirth: req.body.dob,
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
            return sendUserExistsError(res);
        }
        await collection.create(userData);

        // save user details to the log file after registration
        logUserDetails(userData);

        return sendRegistrationSuccess(res);
    } catch (error) {
        console.error('Registration error:', error);
        return sendInternalServerError(res); // Use helper function
    }
});

// Mount the login router
app.use('/login', loginRouter);

// Route handler for home page
app.get('/home', (req, res) => {
    res.json({message : "successfully loged in"})
    //res.render('home'); // Render home.ejs from the views folder
});

let port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`App is running at port: ${port}`);
});
