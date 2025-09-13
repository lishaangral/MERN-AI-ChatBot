import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const createToken = (id: string, email: string, expiresIn: string) => {
    const payload = {id, email};
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT Secret is not defined");
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d"  });
    return token;
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.signedCookies?.[`${process.env.COOKIE_NAME}` || ""];

    if(!token || token.trim() === "") {
        return res.status(401).json({message: "Token Not Received"})
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({message: "Server Configuration Error: JWT Secret is not defined"});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err: any, success: any) => {
        if (err || !success) {
            // reject(err.message);
            return res.status(401).json({message:"Token Expired or Invalid"});
        } 
        const payload = success as JwtPayload & { id: string; email: string };
        res.locals.jwtData = payload;
        next();
    });
}