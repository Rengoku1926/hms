import { Router, Request, Response } from "express";
import prisma from "../prisma/client";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// POST /api/mappings - Assign a doctor to a patient (authenticated)
router.post("/mappings", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId } = req.body;
    if (!patientId || !doctorId) {
       res.status(400).json({ error: "Patient ID and Doctor ID are required." });
       return
    }
    const userId = req.userId;
    // Optionally verify that the patient belongs to the authenticated user
    const patient = await prisma.patient.findFirst({ where: { id: Number(patientId), userId } });
    if (!patient) {
       res.status(404).json({ error: "Patient not found or unauthorized." });
       return
    }
    const mapping = await prisma.mapping.create({
      data: {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
      },
    });
    res.status(201).json(mapping);
  } catch (error) {
    console.error("Create mapping error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/mappings - Retrieve all patient-doctor mappings
router.get("/mappings", async (req: Request, res: Response) => {
  try {
    const mappings = await prisma.mapping.findMany({
      include: { patient: true, doctor: true },
    });
    res.json(mappings);
  } catch (error) {
    console.error("Get mappings error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/mappings/:patientId - Get all doctors assigned to a specific patient (authenticated)
router.get("/mappings/:patientId", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const mappings = await prisma.mapping.findMany({
      where: { patientId: Number(patientId) },
      include: { doctor: true },
    });
    res.json(mappings);
  } catch (error) {
    console.error("Get mappings by patient error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE /api/mappings/:id - Remove a doctor from a patient (authenticated)
router.delete("/mappings/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mapping = await prisma.mapping.findUnique({ where: { id: Number(id) } });
    if (!mapping) {
       res.status(404).json({ error: "Mapping not found." });
       return
    }
    await prisma.mapping.delete({ where: { id: Number(id) } });
    res.json({ message: "Mapping deleted successfully." });
  } catch (error) {
    console.error("Delete mapping error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
