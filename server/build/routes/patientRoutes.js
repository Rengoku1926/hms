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
const client_1 = __importDefault(require("../prisma/client"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/patients - Add a new patient (authenticated users only)
router.post("/patients", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "Patient name is required." });
            return;
        }
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const patient = yield client_1.default.patient.create({
            data: { name, userId },
        });
        res.status(201).json(patient);
    }
    catch (error) {
        console.error("Create patient error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// GET /api/patients - Retrieve all patients created by the authenticated user
router.get("/patients", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const patients = yield client_1.default.patient.findMany({ where: { userId } });
        res.json(patients);
    }
    catch (error) {
        console.error("Get patients error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// GET /api/patients/:id - Get details of a specific patient
router.get("/patients/:id", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const patient = yield client_1.default.patient.findFirst({
            where: { id: Number(id), userId },
        });
        if (!patient) {
            res.status(404).json({ error: "Patient not found." });
            return;
        }
        res.json(patient);
    }
    catch (error) {
        console.error("Get patient error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// PUT /api/patients/:id - Update patient details
router.put("/patients/:id", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.userId;
        const patient = yield client_1.default.patient.findFirst({
            where: { id: Number(id), userId },
        });
        if (!patient) {
            res.status(404).json({ error: "Patient not found." });
            return;
        }
        const updatedPatient = yield client_1.default.patient.update({
            where: { id: Number(id) },
            data: { name: name || patient.name },
        });
        res.json(updatedPatient);
    }
    catch (error) {
        console.error("Update patient error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// DELETE /api/patients/:id - Delete a patient record
router.delete("/patients/:id", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const patient = yield client_1.default.patient.findFirst({
            where: { id: Number(id), userId },
        });
        if (!patient) {
            res.status(404).json({ error: "Patient not found." });
            return;
        }
        yield client_1.default.patient.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "Patient deleted successfully." });
    }
    catch (error) {
        console.error("Delete patient error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
exports.default = router;
