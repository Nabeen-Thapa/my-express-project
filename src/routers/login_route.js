import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import collection from '../config.js'; // to accress connection
const app = express();
const loginRouter = express.Router();
import { 
    sendUserExistsError, 
    sendInvalidRequestError, 
    sendInternalServerError, 
    sendRegistrationSuccess, 
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendLogoutSuccess
} from '../helper_functions/helpers.js'; // Import helper functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

loginRouter.get('/', (req, res) => {
    res.render('login'); // Render login form
});



const refreshTokens = [];
// Function to generate access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' }); // Use expiresIn
}

//for the token
app.post('/token', (req, res)=>{
    const refreshToken = req.body.token
    if (refreshToken == null) return sendUnauthorizedError(res);
    if (!refreshTokens.includes(refreshToken)) return sendForbiddenError(res);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if(err) return sendForbiddenError(res);
        const accessToken = generateAccessToken({username :user.username});
        res.json({accessToken :accessToken})
    })
});


// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return sendUnauthorizedError(res); // If token is missing
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return sendForbiddenError(res); // If token is invalid
        req.user = user; // Store user info from token
        next(); // Continue to the next middleware or route handler
    });
}

//for the login
loginRouter.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await collection.findOne({ username });

        if (!user) {
            return sendNotFoundError(res);
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return sendUnauthorizedError(res);
        }
        
        //res.redirect('/home');//redirect home page

        //for jwt token
        const userLogin = {username: username , password : password};
        const accessToken = generateAccessToken(userLogin);
        const refreshToken = jwt.sign(userLogin, process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        res.json({ accessToken: accessToken, refreshToken: refreshToken });
   
    } catch (error) {
        console.error('Login error:', error);
        return  sendInternalServerError(res);
    }
});

export default loginRouter;
