import express from "express";
import {
  getConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from "../controllers/consultationsController.js";

const router = express.Router();

router.get("/", getConsultations);
router.get("/:id", getConsultationById);
router.post("/", createConsultation);
router.put("/:id", updateConsultation);
router.delete("/:id", deleteConsultation);

export default router;