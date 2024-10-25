import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { collectionToken, redisClient } from '../config.js'; // Access token collection

import { 
    sendUnauthorizedError,
    sendInternalServerError
} from '../helper_functions/helpers.js'; // Import helper functions

const logoutRouter = express.Router();

// Middleware to parse JSON and URL-encoded form data
logoutRouter.use(express.json());
logoutRouter.use(express.urlencoded({ extended: true }));

// Logout route
logoutRouter.post('/logout', async (req, res) => {
    const refreshToken = req.body.token; // Expect the refresh token in the body
    
    // Check if the refresh token is provided
    if (!refreshToken) return sendUnauthorizedError(res);

    try {
        const userKeys = await redisClient.keys('user:*');
        let redisUserId;
        for(const key of userKeys){
            const storedRefreshToken = await redisClient.hget(key, 'refreshTOken');
            if(storedRefreshToken === refreshToken){
                redisUserId = await redisClient.hget(key, 'userId');
                await redisClient.del(key);
                res.json({ message: "Logout successful from redis" });
                break;
            }
        }


        // Check if the refresh token exists in the database
        const userTokenData = await collectionToken.findOne({ refreshToken });
        
        if (!userTokenData) {
            return sendUnauthorizedError(res); // Token not found, return unauthorized
        }

        const userId = userTokenData.userId;

        // Remove token data from the token collection
        await collectionToken.deleteOne({ userId });

        // If you're using an array to store refresh tokens in memory, remove it from there too
        // const index = refreshTokens.indexOf(refreshToken);
        // if (index > -1) {
        //     refreshTokens.splice(index, 1); // Remove the token from the array
        // }

        res.json({ message: "Logout successful" });
    } catch (error) {
        console.error('Error during logout:', error);
        return sendInternalServerError(res); // Handle server errors
    }
});

export default logoutRouter;
