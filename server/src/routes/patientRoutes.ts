import { Router, Request, Response } from "express";
import prisma from "../prisma/client";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// POST /api/patients - Add a new patient (authenticated users only)
router.post("/patients", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ error: "Patient name is required." });
        return;
    }
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return
    }
    const patient = await prisma.patient.create({
      data: { name, userId },
    });
    res.status(201).json(patient);
  } catch (error) {
    console.error("Create patient error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/patients - Retrieve all patients created by the authenticated user
router.get("/patients", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const patients = await prisma.patient.findMany({ where: { userId } });
    res.json(patients);
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/patients/:id - Get details of a specific patient
router.get("/patients/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const patient = await prisma.patient.findFirst({
      where: { id: Number(id), userId },
    });
    if (!patient) {
      res.status(404).json({ error: "Patient not found." });
      return 
    }
    res.json(patient);
  } catch (error) {
    console.error("Get patient error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT /api/patients/:id - Update patient details
router.put("/patients/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.userId;
    const patient = await prisma.patient.findFirst({
      where: { id: Number(id), userId },
    });
    if (!patient) {
      res.status(404).json({ error: "Patient not found." });
      return 
    }
    const updatedPatient = await prisma.patient.update({
      where: { id: Number(id) },
      data: { name: name || patient.name },
    });
    res.json(updatedPatient);
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE /api/patients/:id - Delete a patient record
router.delete("/patients/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const patient = await prisma.patient.findFirst({
      where: { id: Number(id), userId },
    });
    if (!patient) {
      res.status(404).json({ error: "Patient not found." });
      return 
    }
    await prisma.patient.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Patient deleted successfully." });
  } catch (error) {
    console.error("Delete patient error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
