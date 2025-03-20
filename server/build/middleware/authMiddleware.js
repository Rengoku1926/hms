"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Forbidden" });
            }
            req.userId = decoded.userId;
            next();
        });
    }
    else {
        res.status(401).json({ error: "Unauthorized" });
    }
};
exports.authenticateJWT = authenticateJWT;
