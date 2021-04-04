import {Request, Response, Router} from "express";

const router = Router();

// Get home page
router.get('/', (req: Request, res: Response) => {
    res.json({
        message: "Welcome to the api website!"
    });
});

export default router;
