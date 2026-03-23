import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { register, login } from '../controllers/authController';

const router = Router();

// Middleware to handle validation errors
const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
    '/register',
    [
        body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters'),

        body('email')
            .isEmail()
            .withMessage('Must be a valid email address'),

        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),

        validate
    ],
    register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and return JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid email or password
 */
router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Must be a valid email address'),

        body('password')
            .notEmpty()
            .withMessage('Password is required'),

        validate
    ],
    login
);

export default router;