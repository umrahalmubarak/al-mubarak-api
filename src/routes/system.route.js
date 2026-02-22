import express from "express";
import {
  getSystemSettings,
  updateSystemSettings,
  resetDatabase,
} from "../controllers/system.controller.js";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get branding (can be public or protected — your choice)
router.get("/settings", getSystemSettings, 
    authMiddleware,
    authorizeRoles("SUPERADMIN"), 
);

// Update branding (SUPERADMIN only)
router.put(
  "/settings",
  authMiddleware,
  authorizeRoles("SUPERADMIN"),
  updateSystemSettings
);

// Reset database (SUPERADMIN only)
router.post(
  "/reset",
  authMiddleware,
  authorizeRoles("SUPERADMIN"),
  resetDatabase
);

export default router;