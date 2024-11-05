// index.js
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import registerRouter from './controllers/userRegister.js';
import loginRouter from './controllers/login_route.js';
import cloudImgRoute from './controllers/cloud_img_upload.js';
import logger from './utils/logger.js';
import homeRute from './controllers/home_route.js';
import logoutRouter from './controllers/logout_route.js';
import getNewAccessToken from './controllers/get_new_accress_token.js';
import forgetPassword from './controllers/forget_password.js';
import changePassword from './controllers/change_password.js';
import viewRadisData from './controllers/view_radis_data.js';
import addBlog from './controllers/add_blog.js';
import deleteBLog from './controllers/delete_blog.js';
import viewBlog from './controllers/view_blog.js';
import sessionCheckRouter from './controllers/session_check.js';
import session from 'express-session'; 
import RedisStore from 'connect-redis'; 
import { redisClient } from './config.js';
import updateUser from './controllers/update_user.js';
import updatePost from './controllers/update_post.js';

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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('login'); // Render login form
});

app.get('/register', (req, res) => {
    res.render('register'); // Render login form
});

app.use(session({
        store: new RedisStore({ client: redisClient }), // Use Redis for session storage
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60 * 60 * 24 * 10 * 1000 }, // Expire session in 10 days
    })
);
app.use((req, res, next) => {
    console.log("Session Middleware Check:", req.session);
    next();
});

// Define routes
app.use('/api', loginRouter);
app.use('/api', logoutRouter);
app.use('/api', getNewAccessToken);
app.use('/api', registerRouter);
app.use('/api', cloudImgRoute); 
app.use('/api', homeRute);
app.use('/api', forgetPassword);
app.use('/api', changePassword);
app.use('/api', updateUser);
app.use('/api', viewRadisData);
app.use('/api', addBlog);
app.use('/api', viewBlog);
app.use('/api', updatePost);
app.use('/api', deleteBLog);
app.use('/api', sessionCheckRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`App is running at port: ${port}`);
});
