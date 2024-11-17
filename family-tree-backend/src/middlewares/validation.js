// const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { RELATIONSHIP_STATE } = require("../config/constants");

class ValidationMiddleware {
  static validatePersonId(req, res, next) {
    const { personId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(personId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid person ID format",
      });
    }
    next();
  }

  static validateRelationshipId(req, res, next) {
    const { relationshipId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(relationshipId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid relationship ID format",
      });
    }
    next();
  }

  static validateInitialTreeData(req, res, next) {
    const { grandFather: grandfather, grandMother: grandmother, relationship } = req.body;

    // Check for required objects
    if (!grandfather || !grandmother || !relationship) {
      return res.status(400).json({
        success: false,
        error: "Missing required family members or relationship data",
      });
    }

    // Basic required fields for both
    const requiredPersonFields = ["fullName"];
    for (const [role, person] of [
      ["Grandfather", grandfather],
      ["Grandmother", grandmother],
    ]) {
      const missingFields = requiredPersonFields.filter(
        (field) => !person[field]
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields for ${role}: ${missingFields.join(
            ", "
          )}`,
        });
      }
    }

    next();
  }

  static validateSpouseData(req, res, next) {
    const { spouse, relationship } = req.body;

    if (!spouse) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Required spouse fields
    const requiredSpouseFields = ["fullName"];
    const missingSpouseFields = requiredSpouseFields.filter(
      (field) => !spouse[field]
    );

    if (missingSpouseFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required spouse fields: ${missingSpouseFields.join(
          ", "
        )}`,
      });
    }

    // Validate relationship state
    const validStates = Object.values(RELATIONSHIP_STATE);
    if (relationship?.state && !validStates.includes(relationship.state)) {
      return res.status(400).json({
        success: false,
        error: "Invalid relationship state",
      });
    }

    next();
  }

  static validateChildData(req, res, next) {
    const { child } = req.body;

    if (!child) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: child",
      });
    }

    // Required child fields
    const requiredChildFields = ["fullName", "sex"];
    const missingChildFields = requiredChildFields.filter(
      (field) => !child[field]
    );

    if (missingChildFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required child fields: ${missingChildFields.join(
          ", "
        )}`,
      });
    }

    next();
  }
}

module.exports = ValidationMiddleware;
