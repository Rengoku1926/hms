"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = __importDefault(require("../prisma/client"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
// POST /api/auth/register - Register a new user
router.post("/auth/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "Name, email, and password are required." });
            return;
        }
        const existingUser = yield client_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "User already exists." });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield client_1.default.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.status(201).json({ message: "User registered successfully." });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// POST /api/auth/login - Log in a user and return a JWT token
router.post("/auth/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
        }
        const user = yield client_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ error: "Invalid credentials." });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
exports.default = router;
