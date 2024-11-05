import express from "express";
const homeRute = express.Router();
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/authenticate_token.js';

//if user is aready login the desplay welcome to home page message else display the login first lessage
homeRute.get('/api/home', authenticateToken, (req,res)=>{
    res.json({ message: `Hello, ${req.user.username}! This is a protected route.` });
});

export default homeRute;