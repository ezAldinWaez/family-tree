const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Person = require("../models/Person");
const Relationship = require("../models/Relationship");

const ValidateSuposeData = require("../middlewares/ValidateSuposeData");
const validateChildData = require("../middlewares/ValidateChildData");
const validateInitialFamilyData = require("../middlewares/validateInitialFamilyData");

// Helper function to extract year from date
const getYear = (date) => (date ? new Date(date).getFullYear() : null);

// Helper function to get basic person info
const getBasicPersonInfo = (person) => {
  if (!person) return null;
  return {
    id: person._id,
    fullName: person.fullName,
    sex: person.sex,
    birthYear: getYear(person.birth?.date),
    isDead: person.isDead ?? false,
    deathYear: getYear(person.death?.date),
  };
};

// GET /api/tree
router.get("/tree", async (req, res) => {
  try {
    // Fetch all people with minimal required fields
    const people = await Person.find({})
      .select("fullName sex birth.date isDead death.date origin relationships")
      .lean();

    // Fetch all relationships with minimal required fields
    const relationships = await Relationship.find({})
      .select("husb wife state children")
      .lean();

    // Transform people data to required format
    const transformedPeople = people.map((person) => ({
      id: person._id,
      fullName: person.fullName,
      sex: person.sex,
      birthYear: getYear(person.birth?.date),
      isDead: person.isDead || false,
      deathYear: getYear(person.death?.date),
      origin: person.origin,
      relationships: person.relationships,
    }));

    // Transform relationships data to required format
    const transformedRelationships = relationships.map((rel) => ({
      id: rel._id,
      husb: rel.husb,
      wife: rel.wife,
      state: rel.state,
      children: rel.children,
    }));

    return res.status(200).json({
      success: true,
      data: {
        people: transformedPeople,
        relationships: transformedRelationships,
      },
    });
  } catch (error) {
    console.error("Error fetching family tree:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch family tree data",
    });
  }
});

// GET /api/person/:personId
router.get("/person/:personId", async (req, res) => {
  try {
    const { personId } = req.params;

    // Validate personId format
    if (!mongoose.Types.ObjectId.isValid(personId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid person ID format",
      });
    }

    // Fetch person with their basic info
    const person = await Person.findById(personId)
      .populate({
        path: "origin",
        populate: {
          path: "husb wife",
          select: "fullName sex birth death isDead",
        },
      })
      .populate({
        path: "relationships",
        populate: [
          {
            path: "husb wife",
            select: "fullName sex birth death isDead",
          },
          {
            path: "children",
            select: "fullName sex birth death isDead",
          },
        ],
      })
      .lean();

    if (!person) {
      return res.status(404).json({
        success: false,
        error: "Person not found",
      });
    }

    // Transform the response data
    const transformedPerson = {
      id: person._id,
      fullName: person.fullName,
      sex: person.sex,
      birth: person.birth,
      isDead: person.isDead,
      death: person.death,
      contact: person.contact,

      // Transform origin (parents) information
      origin: person.origin
        ? {
            id: person.origin._id,
            status: person.origin.state,
            husb: getBasicPersonInfo(person.origin.husb),
            wife: getBasicPersonInfo(person.origin.wife),
          }
        : null,

      // Transform relationships (marriages/partnerships)
      relationships: person.relationships.map((rel) => ({
        id: rel._id,
        status: rel.state,
        marriageStartDate: rel.marriageStartDate,
        marriageEndDate: rel.marriageEndDate,
        // Get spouse info (opposite of current person's sex)
        spouse: getBasicPersonInfo(person.sex === "male" ? rel.wife : rel.husb),
        // Transform children information
        children: rel.children.map((child) => getBasicPersonInfo(child)),
      })),
    };

    return res.status(200).json({
      success: true,
      data: transformedPerson,
    });
  } catch (error) {
    console.error("Error fetching person details:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch person details",
    });
  }
});


// POST /api/tree
router.post('/tree', validateInitialFamilyData, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
      // First, check if there's any existing data in the database
      const existingCount = await Person.countDocuments();
      if (existingCount > 0) {
          return res.status(409).json({
              success: false,
              error: 'Family tree already initialized. Cannot create multiple root families.'
          });
      }

      const { grandFather: gfData, grandMother: gmData, relationship: relData } = req.body;

      // Create grandfather
      const grandfather = new Person({
          fullName: gfData.fullName,
          sex: 'male',
          birth: gfData.birth,
          isDead: gfData.isDead || false,
          death: gfData.death,
          contact: gfData.contact,
          photoUrl: gfData.photoUrl
      });
      await grandfather.save({ session });

      // Create grandmother
      const grandmother = new Person({
          fullName: gmData.fullName,
          sex: 'female',
          birth: gmData.birth,
          isDead: gmData.isDead || false,
          death: gmData.death,
          contact: gmData.contact,
          photoUrl: gmData.photoUrl
      });
      await grandmother.save({ session });

      // Create their relationship
      const relationship = new Relationship({
          husb: grandfather._id,
          wife: grandmother._id,
          state: relData.state || 'married',
          marriageStartDate: relData.marriageStartDate,
          marriagePlace: relData.marriagePlace,
          children: []
      });
      await relationship.save({ session });

      // Update both persons with the relationship
      grandfather.relationships = [relationship._id];
      grandmother.relationships = [relationship._id];
      await Promise.all([
          grandfather.save({ session }),
          grandmother.save({ session })
      ]);

      // Commit the transaction
      await session.commitTransaction();

      // Return response with tree information and guidance
      return res.status(201).json({
          success: true,
          message: 'Family tree initialized successfully',
          data: {
              treeInfo: {
                  rootRelationship: {
                      id: relationship._id,
                      marriageDate: relationship.marriageStartDate,
                      state: relationship.state
                  },
                  grandFather: {
                      id: grandfather._id,
                      fullName: grandfather.fullName
                  },
                  grandMother: {
                      id: grandmother._id,
                      fullName: grandmother.fullName
                  }
              },
              nextSteps: {
                  addChild: {
                      endpoint: '/api/child',
                      method: 'POST',
                      description: 'Add children to this relationship'
                  },
                  viewTree: {
                      endpoint: '/api/tree',
                      method: 'GET',
                      description: 'View the entire family tree'
                  },
                  viewPerson: {
                      endpoint: `/api/person/${grandfather._id}`,
                      method: 'GET',
                      description: 'View detailed information about any family member'
                  }
              }
          }
      });

  } catch (error) {
      await session.abortTransaction();
      console.error('Error initializing family tree:', error);
      
      if (error.name === 'ValidationError') {
          return res.status(400).json({
              success: false,
              error: 'Validation error',
              details: Object.values(error.errors).map(err => err.message)
          });
      }

      return res.status(500).json({
          success: false,
          error: 'Failed to initialize family tree'
      });
  } finally {
      session.endSession();
  }
});


// POST /api/spouse
router.post("/spouse", ValidateSuposeData, async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      personId,
      spouse: spouseData,
      relationship: relationshipData,
    } = req.body;

    // Validate personId
    if (!mongoose.Types.ObjectId.isValid(personId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid person ID format",
      });
    }

    // Find the existing person
    const existingPerson = await Person.findById(personId);
    if (!existingPerson) {
      return res.status(404).json({
        success: false,
        error: "Person not found",
      });
    }

    // Validate spouse's sex is opposite of existing person
    if (existingPerson.sex === spouseData.sex) {
      return res.status(400).json({
        success: false,
        error: "Spouse must be of opposite sex",
      });
    }

    // Create new spouse
    const newSpouse = new Person({
      fullName: spouseData.fullName,
      sex: spouseData.sex,
      birth: {
        date: spouseData.birth?.date,
        place: spouseData.birth?.place,
      },
      isDead: spouseData.isDead || false,
      death: spouseData.isDead
        ? {
            date: spouseData.death?.date,
            place: spouseData.death?.place,
          }
        : undefined,
      contact: {
        currentAddress: spouseData.contact?.currentAddress,
        email: spouseData.contact?.email,
        phone: spouseData.contact?.phone,
      },
    });

    // Save the spouse
    await newSpouse.save({ session });

    // Create new relationship
    const newRelationship = new Relationship({
      husb: spouseData.sex === "male" ? newSpouse._id : existingPerson._id,
      wife: spouseData.sex === "female" ? newSpouse._id : existingPerson._id,
      state: relationshipData.state || "married",
      marriageStartDate: relationshipData.marriageStartDate,
      marriagePlace: relationshipData.marriageStartPlace,
      children: [], // Initially no children
    });

    // Save the relationship
    await newRelationship.save({ session });

    // Update existing person's relationships
    existingPerson.relationships.push(newRelationship._id);
    await existingPerson.save({ session });

    // Update new spouse's relationships
    newSpouse.relationships.push(newRelationship._id);
    await newSpouse.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      data: {
        spouse: {
          id: newSpouse._id,
          fullName: newSpouse.fullName,
        },
        relationship: {
          id: newRelationship._id,
          state: newRelationship.state,
        },
      },
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();

    console.error("Error adding spouse:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to add spouse",
    });
  } finally {
    session.endSession();
  }
});

// POST /api/child
router.post("/child", validateChildData, async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { relationshipId, child: childData } = req.body;

    // Validate relationshipId
    if (!mongoose.Types.ObjectId.isValid(relationshipId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid relationship ID format",
      });
    }

    // Find the relationship and populate parents
    const relationship = await Relationship.findById(relationshipId)
      .populate("husb wife")
      .exec();

    if (!relationship) {
      return res.status(404).json({
        success: false,
        error: "Relationship not found",
      });
    }

    // Validate birth date is after marriage start date (if both dates exist)
    if (relationship.marriageStartDate && childData.birth?.date) {
      const marriageDate = new Date(relationship.marriageStartDate);
      const birthDate = new Date(childData.birth.date);

      if (birthDate < marriageDate) {
        return res.status(400).json({
          success: false,
          error: "Child's birth date cannot be before marriage date",
        });
      }
    }

    // Validate parents are alive at time of birth (if birth date exists)
    if (childData.birth?.date) {
      const birthDate = new Date(childData.birth.date);

      const yearAfterBirthDate = new Date(birthDate);
      yearAfterBirthDate.setFullYear(birthDate.getFullYear() + 1);

      // Check father's death date
      if (
        relationship.husb.isDead &&
        relationship.husb.death?.date &&
        new Date(relationship.husb.death.date) < yearAfterBirthDate
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Father was deceased before child's birth date for longer than a year",
        });
      }

      // Check mother's death date
      if (
        relationship.wife.isDead &&
        relationship.wife.death?.date &&
        new Date(relationship.wife.death.date) < birthDate
      ) {
        return res.status(400).json({
          success: false,
          error: "Mother was deceased before child's birth date",
        });
      }
    }

    // Create new child
    const newChild = new Person({
      fullName: childData.fullName,
      sex: childData.sex,
      birth: {
        date: childData.birth?.date,
        place: childData.birth?.place,
      },
      isDead: childData.isDead || false,
      death: childData.isDead
        ? {
            date: childData.death?.date,
            place: childData.death?.place,
          }
        : undefined,
      contact: {
        currentAddress: childData.contact?.currentAddress,
        email: childData.contact?.email,
        phone: childData.contact?.phone,
      },
      origin: relationshipId, // Set the origin relationship
    });

    // Save the child
    await newChild.save({ session });

    // Update relationship with new child
    relationship.children.push(newChild._id);
    await relationship.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      data: {
        child: {
          id: newChild._id,
          fullName: newChild.fullName,
          sex: newChild.sex,
          birth: newChild.birth,
        },
        relationship: {
          id: relationship._id,
          totalChildren: relationship.children.length,
        },
      },
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();

    console.error("Error adding child:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to add child",
    });
  } finally {
    session.endSession();
  }
});

// DELETE /api/person/:personId
router.delete("/person/:personId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { personId } = req.params;

    // Validate personId
    if (!mongoose.Types.ObjectId.isValid(personId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid person ID format",
      });
    }

    // Find the person with all their relationships
    const person = await Person.findById(personId)
      .populate("relationships")
      .populate("origin");

    if (!person) {
      return res.status(404).json({
        success: false,
        error: "Person not found",
      });
    }

    // Validation helper to check if person can be safely deleted
    const canDeletePerson = async (person) => {
      // Case 1: Person has children
      const relationshipsWithChildren = await Relationship.find({
        $or: [{ husb: person._id }, { wife: person._id }],
        children: { $exists: true, $ne: [] },
      });

      if (relationshipsWithChildren.length > 0) {
        return {
          canDelete: false,
          reason:
            "Cannot delete person who is a parent. This would break children's lineage.",
        };
      }

      return { canDelete: true };
    };

    // Check if person can be safely deleted
    const { canDelete, reason } = await canDeletePerson(person);

    if (!canDelete) {
      return res.status(400).json({
        success: false,
        error: reason,
      });
    }

    // Store information about what will be deleted for the response
    const deletionSummary = {
      person: {
        id: person._id,
        fullName: person.fullName,
      },
      relationships: [],
    };

    // 1. Handle relationships where person is a spouse
    const spouseRelationships = await Relationship.find({
      $or: [{ husb: personId }, { wife: personId }],
    }).populate("husb wife");

    for (const rel of spouseRelationships) {
      // Store relationship info for response
      deletionSummary.relationships.push({
        id: rel._id,
        type: "spouse",
        otherSpouse: {
          id: rel.husb._id.equals(person._id) ? rel.wife._id : rel.husb._id,
          fullName: rel.husb._id.equals(person._id)
            ? rel.wife.fullName
            : rel.husb.fullName,
        },
      });

      // Remove relationship reference from the other spouse
      const otherSpouse = rel.husb._id.equals(person._id) ? rel.wife : rel.husb;
      await Person.updateOne(
        { _id: otherSpouse._id },
        { $pull: { relationships: rel._id } },
        { session }
      );

      // Delete the relationship
      await Relationship.deleteOne({ _id: rel._id }, { session });
    }

    // 2. Handle origin relationship (person's parents)
    if (person.origin) {
      // Remove person from their parents' relationship's children array
      await Relationship.updateOne(
        { _id: person.origin },
        { $pull: { children: person._id } },
        { session }
      );

      deletionSummary.origin = {
        relationshipId: person.origin,
      };
    }

    // 3. Delete the person
    await Person.deleteOne({ _id: personId }, { session });

    // Commit the transaction
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Person and related relationships successfully deleted",
      data: {
        deletionSummary,
        affectedRecords: {
          persons: 1,
          relationships: deletionSummary.relationships.length,
        },
      },
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();

    console.error("Error deleting person:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete person",
    });
  } finally {
    session.endSession();
  }
});

// PUT /api/person/:personId
router.put("/person/:personId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { personId } = req.params;
    const updateData = req.body;

    // Validate personId
    if (!mongoose.Types.ObjectId.isValid(personId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid person ID format",
      });
    }

    // Find person with relationships to validate updates
    const person = await Person.findById(personId)
      .populate({
        path: "relationships",
        populate: {
          path: "children",
        },
      })
      .populate("origin");

    if (!person) {
      return res.status(404).json({
        success: false,
        error: "Person not found",
      });
    }

    // Validate birth/death dates
    const validateDateOrder = (birth, death) => {
      if (birth && death) {
        return new Date(birth) < new Date(death);
      }
      return true;
    };

    if (!validateDateOrder(updateData.birth?.date, updateData.death?.date)) {
      return res.status(400).json({
        success: false,
        error: "Death date must be after birth date",
      });
    }

    // Validate updates don't break family constraints
    if (updateData.birth?.date) {
      // Check if birth date is after parents' marriage
      if (person.origin) {
        const parentRelationship = await Relationship.findById(person.origin);
        if (
          parentRelationship?.marriageStartDate &&
          new Date(updateData.birth.date) <
            new Date(parentRelationship.marriageStartDate)
        ) {
          return res.status(400).json({
            success: false,
            error: "Birth date cannot be before parents' marriage date",
          });
        }
      }

      // Check if person has children and birth date isn't after children's birth
      const hasChildrenAfterBirth = person.relationships.some((rel) =>
        rel.children.some(
          (child) =>
            child.birth?.date &&
            new Date(child.birth.date) < new Date(updateData.birth.date)
        )
      );

      if (hasChildrenAfterBirth) {
        return res.status(400).json({
          success: false,
          error: "Birth date cannot be after children's birth dates",
        });
      }
    }

    // Update person
    const updatedPerson = await Person.findByIdAndUpdate(
      personId,
      {
        $set: {
          fullName: updateData.fullName,
          sex: updateData.sex, // Note: sex usually shouldn't be changeable if person has relationships
          birth: updateData.birth,
          isDead: updateData.isDead,
          death: updateData.death,
          contact: updateData.contact,
        },
      },
      { new: true, session, runValidators: true }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      data: updatedPerson,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating person:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to update person",
    });
  } finally {
    session.endSession();
  }
});

// PUT /api/relationship/:relationshipId
router.put("/relationship/:relationshipId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { relationshipId } = req.params;
    const updateData = req.body;

    // Validate relationshipId
    if (!mongoose.Types.ObjectId.isValid(relationshipId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid relationship ID format",
      });
    }

    // Find relationship with related persons
    const relationship = await Relationship.findById(relationshipId)
      .populate("husb wife children")
      .exec();

    if (!relationship) {
      return res.status(404).json({
        success: false,
        error: "Relationship not found",
      });
    }

    // Validate marriage dates
    const validateMarriageDates = (startDate, endDate) => {
      if (startDate && endDate) {
        return new Date(startDate) < new Date(endDate);
      }
      return true;
    };

    if (
      !validateMarriageDates(
        updateData.marriageStartDate,
        updateData.marriageEndDate
      )
    ) {
      return res.status(400).json({
        success: false,
        error: "Marriage end date must be after start date",
      });
    }

    // Validate marriage dates against children's birth dates
    if (updateData.marriageStartDate && relationship.children.length > 0) {
      const hasChildrenBeforeMarriage = relationship.children.some(
        (child) =>
          child.birth?.date &&
          new Date(child.birth.date) < new Date(updateData.marriageStartDate)
      );

      if (hasChildrenBeforeMarriage) {
        return res.status(400).json({
          success: false,
          error:
            "Marriage start date cannot be after existing children's birth dates",
        });
      }
    }

    // Validate relationship state transitions
    if (updateData.state) {
      const validTransitions = {
        married: ["divorced", "widowed"],
        divorced: [], // Can't transition from divorced
        widowed: [], // Can't transition from widowed
      };

      if (
        relationship.state !== updateData.state &&
        (!validTransitions[relationship.state] ||
          !validTransitions[relationship.state].includes(updateData.state))
      ) {
        return res.status(400).json({
          success: false,
          error: `Invalid state transition from ${relationship.state} to ${updateData.state}`,
        });
      }

      // If transitioning to widowed, require at least one spouse to be deceased
      if (updateData.state === "widowed") {
        const husbDead = relationship.husb.isDead;
        const wifeDead = relationship.wife.isDead;

        if (!husbDead && !wifeDead) {
          return res.status(400).json({
            success: false,
            error:
              "Cannot set relationship to widowed when both spouses are alive",
          });
        }
      }
    }

    // Update relationship
    const updatedRelationship = await Relationship.findByIdAndUpdate(
      relationshipId,
      {
        $set: {
          state: updateData.state,
          marriageStartDate: updateData.marriageStartDate,
          marriageEndDate: updateData.marriageEndDate,
        },
      },
      { new: true, session, runValidators: true }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      data: updatedRelationship,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating relationship:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to update relationship",
    });
  } finally {
    session.endSession();
  }
});

module.exports = router;
