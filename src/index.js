// index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import registerRoute from './controllers/userRegister.js'; // Corrected import
import loginRouter from './controllers/login_route.js';
import cloudImgRoute from './controllers/cloud_img_upload.js'; // Ensure this import is correct
import logger from './utils/logger.js';

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define __dirname for path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine and views directory
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// Define routes
app.use('/api', loginRouter);
app.use('/api', registerRoute);
app.use('/api', cloudImgRoute); // Include the cloud image upload route



const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`App is running at port: ${port}`);
});
