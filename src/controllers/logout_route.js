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


const logoutRouter = express.Router();
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

logoutRouter.get('/', (req, res) => {
    res.render('login'); // Render login form
});


//for logout
logoutRouter.post('/logout',async (req, res) => {
    const refreshToken = req.body.token; // Get token from request body
    if (refreshToken == null) return sendUnauthorizedError(res);

    //delete user token form collection after logout
    const userTokenData = await collectionToken.findOne(({refreshToken}));
    if (!userTokenData) {
        return sendUnauthorizedError(res);
    }
    const userId = userTokenData.userId;
    // Remove user data from the user collection
   //await collection.deleteOne({ id: userId });

//    // Remove token data from the token collection
   await collectionToken.deleteOne({ userId });

    // Remove the refresh token from the refreshTokens array
    const index = refreshTokens.indexOf(refreshToken);
    if (index > -1) {
        refreshTokens.splice(index, 1); // Remove the token
    }

    res.json({ message: "Logout successful" });
});
export default logoutRouter;
