const Query = require('../models/Query');

const queryController = {
    getAll: async (req, res) => {
        try {
            const queries = await Query.find().sort({ createdAt: -1 });
            res.json(queries);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    create: async (req, res) => {
        try {
            const query = new Query(req.body);
            await query.save();
            res.status(201).json(query);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    updateStatus: async (req, res) => {
        try {
            const query = await Query.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: "after" });
            res.json(query);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            await Query.findByIdAndDelete(req.params.id);
            res.json({ message: 'Query deleted' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = queryController;
