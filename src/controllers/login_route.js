import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import util from 'util';
import { collection,  collectionToken} from '../config.js'; // to accress connection
import { refreshAccessToken } from '../auth/auth.js';
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


const refreshTokens = [];//store refrsh tokens
// Function to generate access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' }); // Use expiresIn
}

loginRouter.post('/token', async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return sendUnauthorizedError(res);
    if (!refreshTokens.includes(refreshToken)) return sendForbiddenError(res);
    
    // Convert jwt.verify into a promise
    const verifyToken = util.promisify(jwt.verify);

    try {
        const user = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET); // Await the verification
        const accessToken = generateAccessToken({ username: user.username });

        const findToken = await collectionToken.findOne({ refreshToken: refreshToken });
        if (!findToken) {
            return sendNotFoundError(res);
        }

        findToken.accessToken = accessToken; // Ensure this field exists in your schema
        await findToken.save();
        res.json({ accessToken: accessToken });
        
    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'JsonWebTokenError') {
            return sendForbiddenError(res); // Handle token verification errors
        }
        return sendInternalServerError(res); // For other errors
    }
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

//for logout
loginRouter.post('/logout',async (req, res) => {
    const refreshToken = req.body.token; // Get token from request body
    if (refreshToken == null) return sendUnauthorizedError(res);

    //delete user token form collection after logout
    const userTokenData = await collectionToken.findOne(({refreshToken}));
    if (!userTokenData) {
        return sendUnauthorizedError(res);
    }
    const userId = userTokenData.userId;
   // Remove user data from the user collection
   await collection.deleteOne({ _id: userId });

   // Remove token data from the token collection
   await collectionToken.deleteOne({ userId });

    // Remove the refresh token from the refreshTokens array
    const index = refreshTokens.indexOf(refreshToken);
    if (index > -1) {
        refreshTokens.splice(index, 1); // Remove the token
    }

    res.json({ message: "Logout successful" });
});


//for the login
loginRouter.post('/login', async (req, res) => {
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
       const userId = user.id;
        //res.redirect('/home');//redirect home page
        
        //for jwt token
        const userLogin = {username: username , password : password};
        const accessToken = generateAccessToken(userLogin);
        const refreshToken = jwt.sign(userLogin, process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        const userTokens = {
            accessToken:accessToken,
            refreshToken : refreshToken, 
            userId :userId
        }
         const existToken = await collectionToken.findOne({username:user.username});
        if(existToken){
            existToken.accessToken = accessToken;
            existToken.refreshToken = refreshToken;
            await existToken.save();
        }else {
            await collectionToken.create(userTokens);
        }
        res.json({
            message: "login successfully",
            accessToken: accessToken,
            refreshToken: refreshToken
        });
        


    } catch (error) {
        console.error('Login error:', error);
        return  sendInternalServerError(res);
    }
});

export default loginRouter;
