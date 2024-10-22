// controllers/cloud_img_upload.js
import express from 'express';
import { upload } from '../middleware/image_upload.js'; // Ensure this path is correct

const router = express.Router();

// Endpoint to handle image upload
router.post('/upload', upload.single('profileImage'), (req, res) => {
    try {
        // Check if the file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Cloudinary URL for the uploaded image
        const imageUrl = req.file.path;
        res.json({ imageUrl: imageUrl, message: 'Image uploaded successfully!' });
    } catch (error) {
        // Handle any errors that occur during the upload
        res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
});

export default router; // Export the router for use in index.js
