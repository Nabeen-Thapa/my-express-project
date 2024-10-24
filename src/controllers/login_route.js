import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import util from 'util';
import { collection,  collectionToken} from '../config.js'; // to accress connection
import { refreshAccessToken } from '../auth/auth.js';
import { authenticateToken } from '../middleware/authenticate_token.js';
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
       const userId = user.userId;
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
         const existUserId = await collectionToken.findOne({userId : userId});
        if(existUserId){
            // existUserId.accessToken = accessToken;
            // existUserId.refreshToken = refreshToken;
            // await existUserId.save();
            return res.json({
                message: "You are already logged in",
            });

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
