import { Router } from 'express';

const router = Router();

// Game routes placeholder
router.get('/test', (req, res) => {
  res.json({ message: 'Game routes working!' });
});

export default router;