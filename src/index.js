// index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import registeRoute from './controllers/userRegister.js'; // Corrected import
import loginRouter from './controllers/login_route.js';
import cloudImgRoute from './controllers/cloud_img_upload.js'; // Ensure this import is correct
import logger from './utils/logger.js';
import homeRute from './controllers/home_route.js';
import logoutRouter from './controllers/logout_route.js';
import getNewAccessToken from './controllers/get_new_accress_token.js';
import forgetPassword from './controllers/forget_password.js';
import changePassword from './controllers/change_password.js';

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

app.get('/register', (req, res) => {
    res.render('register'); // Render login form
});
// Define routes
app.use('/api', loginRouter);
app.use('/api', logoutRouter);
app.use('/api', getNewAccessToken);
app.use('/api/register', registeRoute);
app.use('/api', cloudImgRoute); 
app.use('/api', homeRute);
app.use('/api', forgetPassword);
app.use('/api', changePassword);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`App is running at port: ${port}`);
});
