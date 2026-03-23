import { Request, Response } from 'express';
import Session from '../models/Session';

export const saveDraft = async (req: any, res: Response) => {
  try {
    const { title, content, sessionId } = req.body; 
    const userId = req.user.id;
    let session;
    
    if (sessionId) {
      session = await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        { title, content }, 
        { new: true }
      );
    } else {
      session = new Session({ userId, title, content }); 
      await session.save();
    }

    res.json(session);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({ error: "Failed to save document" });
  }
};

export const getAllSessions = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const sessions = await Session.find({ userId }).sort({ updatedAt: -1 });
        
        res.json(sessions);
    } catch (error) {
        console.error("GET ALL ERROR:", error);
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
}

export const getSessionById = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const session = await Session.findOne({ _id: id, userId });
        
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        res.json(session);
    } catch (error) {
        console.error("GET ONE ERROR:", error);
        res.status(500).json({ error: "Failed to fetch the session" });
    }
};

export const updateSession = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, content, status } = req.body;

        const updatedSession = await Session.findOneAndUpdate(
            { _id: id, userId },
            { 
                $set: { 
                    ...(title !== undefined && { title }), 
                    ...(content !== undefined && { content }),
                    ...(status !== undefined && { status }) 
                } 
            },
            { new: true, runValidators: true }
        );

        if (!updatedSession) {
            return res.status(404).json({ error: "Session not found or unauthorized" });
        }

        res.json(updatedSession);
    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({ error: "Failed to update session" });
    }
};

export const deleteSession = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deletedSession = await Session.findOneAndDelete({ _id: id, userId });

        if (!deletedSession) {
            return res.status(404).json({ error: "Session not found or already deleted" });
        }

        res.json({ message: "Session deleted successfully" });
    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({ error: "Failed to delete session" });
    }
};