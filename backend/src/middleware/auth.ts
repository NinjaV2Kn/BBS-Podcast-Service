import { Request, Response, NextFunction } from 'express';

// JWT authentication middleware
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // TODO: Verify JWT token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
