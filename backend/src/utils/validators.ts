import { NextFunction, Request, Response } from 'express';
import { body, ValidationChain, validationResult } from "express-validator";

const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) {
                break;
            }
        }
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        return res.status(422).json({
            message: "Validation failed",
            errors: errors.array()
        });
    };
};

const loginValidator = [
    body("email").trim().isEmail().withMessage("Email is required"),
    body("password").trim().isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
];

const signupValidator = [
    body("name").notEmpty().withMessage("Name is required"),
    ...loginValidator
];

export {validate, loginValidator, signupValidator};