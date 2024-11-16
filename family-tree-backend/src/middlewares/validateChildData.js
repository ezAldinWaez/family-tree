// Validation middleware
const validateChildData = (req, res, next) => {
    const { relationshipId, child } = req.body;

    if (!relationshipId || !child) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    // Required child fields
    const requiredChildFields = ['fullName', 'sex'];
    const missingChildFields = requiredChildFields.filter(field => !child[field]);
    
    if (missingChildFields.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Missing required child fields: ${missingChildFields.join(', ')}`
        });
    }

    next();
};

module.exports = validateChildData;