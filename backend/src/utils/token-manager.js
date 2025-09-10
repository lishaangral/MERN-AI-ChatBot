import jwt from "jsonwebtoken";
export const createToken = (id, email, expiresIn) => {
    const payload = { id, email };
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT Secret is not defined");
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return token;
};
export const verifyToken = (req, res, next) => {
    const token = req.signedCookies?.[`${process.env.COOKIE_NAME}` || ""];
    if (!token || token.trim() === "") {
        return res.status(401).json({ message: "Token Not Received" });
    }
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "Server Configuration Error: JWT Secret is not defined" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, success) => {
        if (err || !success) {
            // reject(err.message);
            return res.status(401).json({ message: "Token Expired or Invalid" });
        }
        const payload = success;
        res.locals.jwtData = payload;
        next();
    });
};
