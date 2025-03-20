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
// POST /api/doctors - Add a new doctor (authenticated users only)
router.post("/doctors", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, speciality } = req.body;
        if (!name) {
            res.status(400).json({ error: "Doctor name is required." });
            return;
        }
        const doctor = yield client_1.default.doctor.create({
            data: { name, speciality },
        });
        res.status(201).json(doctor);
    }
    catch (error) {
        console.error("Create doctor error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// GET /api/doctors - Retrieve all doctors
router.get("/doctors", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield client_1.default.doctor.findMany();
        res.json(doctors);
    }
    catch (error) {
        console.error("Get doctors error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// GET /api/doctors/:id - Get details of a specific doctor
router.get("/doctors/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const doctor = yield client_1.default.doctor.findUnique({ where: { id: Number(id) } });
        if (!doctor) {
            res.status(404).json({ error: "Doctor not found." });
            return;
        }
        res.json(doctor);
    }
    catch (error) {
        console.error("Get doctor error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// PUT /api/doctors/:id - Update doctor details (authenticated)
router.put("/doctors/:id", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, speciality } = req.body;
        const doctor = yield client_1.default.doctor.findUnique({ where: { id: Number(id) } });
        if (!doctor) {
            res.status(404).json({ error: "Doctor not found." });
            return;
        }
        const updatedDoctor = yield client_1.default.doctor.update({
            where: { id: Number(id) },
            data: { name: name || doctor.name, speciality: speciality || doctor.speciality },
        });
        res.json(updatedDoctor);
    }
    catch (error) {
        console.error("Update doctor error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
// DELETE /api/doctors/:id - Delete a doctor record (authenticated)
router.delete("/doctors/:id", authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const doctor = yield client_1.default.doctor.findUnique({ where: { id: Number(id) } });
        if (!doctor) {
            res.status(404).json({ error: "Doctor not found." });
            return;
        }
        yield client_1.default.doctor.delete({ where: { id: Number(id) } });
        res.json({ message: "Doctor deleted successfully." });
    }
    catch (error) {
        console.error("Delete doctor error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
exports.default = router;
