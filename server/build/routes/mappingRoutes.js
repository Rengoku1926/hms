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
// POST /api/mappings - Assign a doctor to a patient (authenticated)
router.post("/mappings", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId, doctorId } = req.body;
        if (!patientId || !doctorId) {
            res.status(400).json({ error: "Patient ID and Doctor ID are required." });
            return;
        }
        const userId = req.userId;
        // Optionally verify that the patient belongs to the authenticated user
        const patient = yield client_1.default.patient.findFirst({ where: { id: Number(patientId), userId } });
        if (!patient) {
            res.status(404).json({ error: "Patient not found or unauthorized." });
            return;
        }
        const mapping = yield client_1.default.mapping.create({
            data: {
                patientId: Number(patientId),
                doctorId: Number(doctorId),
            },
        });
        res.status(201).json(mapping);
    }
    catch (error) {
        console.error("Create mapping error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// GET /api/mappings - Retrieve all patient-doctor mappings
router.get("/mappings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mappings = yield client_1.default.mapping.findMany({
            include: { patient: true, doctor: true },
        });
        res.json(mappings);
    }
    catch (error) {
        console.error("Get mappings error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// GET /api/mappings/:patientId - Get all doctors assigned to a specific patient (authenticated)
router.get("/mappings/:patientId", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId } = req.params;
        const mappings = yield client_1.default.mapping.findMany({
            where: { patientId: Number(patientId) },
            include: { doctor: true },
        });
        res.json(mappings);
    }
    catch (error) {
        console.error("Get mappings by patient error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// DELETE /api/mappings/:id - Remove a doctor from a patient (authenticated)
router.delete("/mappings/:id", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const mapping = yield client_1.default.mapping.findUnique({ where: { id: Number(id) } });
        if (!mapping) {
            res.status(404).json({ error: "Mapping not found." });
            return;
        }
        yield client_1.default.mapping.delete({ where: { id: Number(id) } });
        res.json({ message: "Mapping deleted successfully." });
    }
    catch (error) {
        console.error("Delete mapping error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
exports.default = router;
