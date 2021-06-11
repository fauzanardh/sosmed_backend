import {Request, Response, Router} from "express";

const router = Router();

// Get home page
router.get('/', (req: Request, res: Response) => {
    res.json({
        errorCode: 0,
        message: "welcome to the api server!",
        data: {}
    });
});

export default router;
