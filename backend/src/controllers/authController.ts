import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET ;

export const register = async (req: Request, res: Response) => {
    try {
        const {username , email, password} = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            passwordHash
        });

        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if(!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const options: SignOptions = {
            expiresIn: (process.env.JWT_EXPIRE || undefined) as any,
        };

        
        const token = jwt.sign(
            { id: user._id.toString() }, 
            secret, 
            options
        );

        res.json({ token, username: user.username });

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};