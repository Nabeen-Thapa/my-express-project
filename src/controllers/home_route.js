import express from "express";
const homeRute = express.Router();
import { authenticateToken } from '../middleware/authenticate_token.js';


homeRute.get('/home', authenticateToken, (req,res)=>{
    // res.json({ message: `Hello, ${req.user.username}! This is a protected route.` });
    res.render('home', { username: req.session.username });
});

export default homeRute;