// Validation middleware
const validateInitialFamilyData = (req, res, next) => {
    const { grandFather, grandMother, relationship } = req.body;

    // Check for required objects
    if (!grandFather || !grandMother || !relationship) {
        return res.status(400).json({
            success: false,
            error: 'Missing required family members or relationship data'
        });
    }

    // Validate grandfather data
    if (grandFather.sex !== 'male') {
        return res.status(400).json({
            success: false,
            error: 'Grandfather must be male'
        });
    }

    // Validate grandmother data
    if (grandMother.sex !== 'female') {
        return res.status(400).json({
            success: false,
            error: 'Grandmother must be female'
        });
    }

    // Basic required fields for both
    const requiredPersonFields = ['fullName', 'birth'];
    for (const [role, person] of [['Grandfather', grandFather], ['Grandmother', grandMother]]) {
        const missingFields = requiredPersonFields.filter(field => !person[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields for ${role}: ${missingFields.join(', ')}`
            });
        }
    }

    next();
};

module.exports = validateInitialFamilyData;