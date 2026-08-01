import SettingsModel from "./settings.model.js";

export const getSettings = async (req, res) => {
    try {
        let settings = await SettingsModel.findOne();
        if (!settings) {
            settings = await SettingsModel.create({});
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal server error" });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const settings = await SettingsModel.findOneAndUpdate({}, updates, { new: true, upsert: true });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal server error" });
    }
};
