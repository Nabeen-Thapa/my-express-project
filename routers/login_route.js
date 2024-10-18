import express from 'express';
import bcrypt from 'bcrypt';
import collection from '../src/config.js'; // Adjust the path as per your project structure

const loginRouter = express.Router();

loginRouter.get('/', (req, res) => {
    res.render('login'); // Render login form
});

loginRouter.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await collection.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send('Invalid password');
        }
        if(!user && !passwordMatch && req.url==='/home'){
            return res.status(404).send('User not found');
        }
        else{
            res.redirect('/home');
        }

        // Redirect to home page on successful login
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Error during login');
    }
});

export default loginRouter;
