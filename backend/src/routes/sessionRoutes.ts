import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
  saveDraft,
  getAllSessions,
  getSessionById,
  deleteSession,
  updateSession
} from '../controllers/sessionController';
import { authenticate } from '../middleware/authMiddleware';
const router = Router();

/**
 * @swagger
 * /api/sessions/draft:
 *   post:
 *     summary: Save or update a session draft
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 description: The text content of the editor
 *               sessionId:
 *                 type: string
 *                 description: Optional. Include to update an existing draft.
 *     responses:
 *       200:
 *         description: Draft saved successfully
 *       401:
 *         description: Access denied (Missing or invalid token)
 */
router.post(
    '/draft',
    authenticate,
    [
        body('content')
            .isString()
            .withMessage('Content must be a string'),

        body('sessionId')
            .optional()
            .isMongoId()
            .withMessage('Invalid session ID format'),

        (req: any, res: any, next: any) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }

            next();
        }
    ],
    saveDraft
);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all sessions for the logged-in user
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of user sessions
 *       401:
 *         description: Access denied
 */
router.get('/', authenticate, getAllSessions);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get a specific session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     responses:
 *       200:
 *         description: The session data
 *       404:
 *         description: Session not found
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid session ID format'),

    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  getSessionById
);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a specific session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       404:
 *         description: Session not found
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid session ID format'),

    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  deleteSession
);

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Update an existing session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, final]
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Session not found
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid session ID format'),

    body('content')
      .optional()
      .isString()
      .withMessage('Content must be a string'),

    body('status')
      .optional()
      .isIn(['draft', 'final'])
      .withMessage('Status must be draft or final'),

    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  updateSession
);

export default router;