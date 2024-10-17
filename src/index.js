import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from '../middleware/image_upload.js';
import collection from './config.js';
import bcrypt from 'bcrypt';
import loginRouter from '../routers/login_route.js'; // Correct relative path
import { logUserDetails } from '../utils/logger.js'; // Import the logging utility

const app = express();
const saltRounds = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
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
            return res.status(400).send('User with this email, phone, or username already exists.');
        }

        await collection.create(userData);
        // Log the user details to the log file after successful registration
        logUserDetails(userData);

        res.status(201).send('<script>alert("User registered successfully"); window.location.href = "/";</script>');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Error registering user');
    }
});

// Mount the login router
app.use('/login', loginRouter);

// Route handler for home page
app.get('/home', (req, res) => {
    res.render('home'); // Render home.ejs from the views folder
});

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is running at port: ${port}`);
});
