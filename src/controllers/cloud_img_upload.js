// controllers/cloud_img_upload.js
import express from 'express';
import { upload } from '../middleware/image_upload.js';
const router = express.Router();
import cloudinary from './middleware/cloudinary.js';
import {
    sendUserExistsError,
    sendInvalidRequestError,
    sendInternalServerError,
    sendBadRequestError,
    sendRegistrationSuccess,
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendLogoutSuccess
} from '../helper_functions/helpers.js'

// Endpoint to handle image upload
router.post('/upload', upload.single('profileImage'),async  (req, res) => {
    try {
        // file was uploaded
        if (!req.file) {
            return sendBadRequestError(res, 'No file uploaded.');
        }

        const result =  await cloudinary.uploader.upload(rey.file.path);
        // Cloudinary URL for the uploaded image
        const imageUrl = req.file.path;
        res.json({ imageUrl: imageUrl, message: 'Image uploaded successfully!' });
    } catch (error) {
        // Handle any errors that occur during the upload
        res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
});

export default router; // Export the router for use in index.js
