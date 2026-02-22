import {
  resetDatabaseService,
  getSystemSettingsService,
  updateSystemSettingsService,
} from "../services/system.service.js";

//Reset system setting
export const resetDatabase = async (req, res) => {
  try {
    if (req.body.key !== process.env.SYSTEM_RESET_KEY) {
      return res.status(403).json({ message: "Invalid reset key" });
    }

    await resetDatabaseService();

    return res.json({ message: "Database reset successful" });
  } catch (error) {
    console.error("Reset error:", error);
    return res.status(500).json({ message: "Reset failed" });
  }
};

//Get system setting
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await getSystemSettingsService();
    return res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

// UPDATE settings
export const updateSystemSettings = async (req, res) => {
  try {
    const { businessName, logoUrl } = req.body;

    const updated = await updateSystemSettingsService({
      businessName,
      logoUrl,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({ success: false, message: "Failed to update settings" });
  }
};