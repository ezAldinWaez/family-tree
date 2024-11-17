const mongoose = require("mongoose");

const Person = require("../models/Person");
const Relationship = require("../models/Relationship");

const PersonService = require("../services/personService");
const { SEX, RELATIONSHIP_STATE } = require("../config/constants");
const { populate } = require("dotenv");

class TreeController {
  static async getTree(req, res) {
    try {
      const people = await Person.find({})
        .select(
          "fullName sex birth.date isDead death.date origin relationships"
        )
        .lean();

      const transformedPeople = people.map((p) => ({
        ...PersonService.getBasicInfo(p),
        origin: p.origin,
        relationships: p.relationships,
      }));

      const relationships = await Relationship.find({})
        .select("state husb wife children")
        .lean();

      const transformedRelationships = relationships.map((r) => ({
        id: r._id,
        state: r.state,
        husb: r.husb,
        wife: r.wife,
        children: r.children,
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
  }

  static async getPerson(req, res) {
    try {
      const { personId } = req.params;

      const person = await Person.findById(personId)
        .populate({
          path: "origin",
          populate: {
            path: "husb wife",
            select: "fullName sex birth.date isDead death.date",
          },
        })
        .populate({
          path: "relationships",
          populate: {
            path: "husb wife children",
            select: "fullName sex birth.date isDead death.date",
          },
        })
        .lean();

      if (!person) {
        return res.status(404).json({
          success: false,
          error: "Person not found",
        });
      }

      const transformedPerson = {
        ...PersonService.getFullInfo(person),
        origin: person.origin
          ? {
              id: person.origin._id,
              state: person.origin.state,
              husb: PersonService.getBasicInfo(person.origin.husb),
              wife: PersonService.getBasicInfo(person.origin.wife),
            }
          : null,
        relationships: person.relationships.map((r) => ({
          id: r._id,
          state: r.state,
          marriageInfo: r.marriageInfo,
          spouse:
            person.sex === SEX.MALE
              ? PersonService.getBasicInfo(r.wife)
              : PersonService.getBasicInfo(r.husb),
          children: r.children.map(PersonService.getBasicInfo),
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
  }

  static async initTree(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingCount = await Person.countDocuments();
      if (existingCount > 0) {
        return res.status(409).json({
          success: false,
          error:
            "Family tree already initialized. Cannot create multiple root families.",
        });
      }

      const {
        grandFather: gfData,
        grandMother: gmData,
        relationship: relData,
      } = req.body;

      // Create grandfather
      gfData.sex = SEX.MALE;
      const grandfather = new Person(PersonService.makeFullInfo(gfData));
      await grandfather.save({ session });

      // Create grandmother
      gmData.sex = SEX.FEMALE;
      const grandmother = new Person(PersonService.makeFullInfo(gmData));
      await grandmother.save({ session });

      // Create their relationship
      const relationship = new Relationship({
        husb: grandfather._id,
        wife: grandmother._id,
        state: relData.state || RELATIONSHIP_STATE.MARRIED,
        marriageInfo: {
          startDate: relData.marriageInfo?.startDate,
          endDate: relData.marriageInfo?.endDate,
        },
        children: [],
      });
      await relationship.save({ session });

      // Update both persons with the relationship
      grandfather.relationships = [relationship._id];
      grandmother.relationships = [relationship._id];
      await Promise.all([
        grandfather.save({ session }),
        grandmother.save({ session }),
      ]);

      // Commit the transaction
      await session.commitTransaction();

      // Return response with tree information and guidance
      return res.status(201).json({
        success: true,
        data: {
          rootRelationship: {
            id: relationship._id,
            state: relationship.state,
          },
          grandFather: {
            id: grandfather._id,
            fullName: grandfather.fullName,
          },
          grandMother: {
            id: grandmother._id,
            fullName: grandmother.fullName,
          },
        },
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error initializing family tree:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: Object.values(error.errors).map((err) => err.message),
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to initialize family tree",
      });
    } finally {
      session.endSession();
    }
  }

  static async addSpouse(req, res) {
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { personId } = req.params;

      const { spouse: spouseData, relationship: relData } = req.body;

      // Find the existing person
      const person = await Person.findById(personId);
      if (!person) {
        return res.status(404).json({
          success: false,
          error: "Person not found",
        });
      }

      const getOppositeSex = (sex) =>
        sex === SEX.MALE
          ? SEX.FEMALE
          : sex === SEX.FEMALE
          ? SEX.MALE
          : undefined;

      // Create new spouse
      spouseData.sex = getOppositeSex(person.sex);
      const newSpouse = new Person(PersonService.makeFullInfo(spouseData));

      // Save the spouse
      await newSpouse.save({ session });

      // Create new relationship
      const newRelationship = new Relationship({
        husb: spouseData.sex === SEX.MALE ? newSpouse._id : person._id,
        wife: spouseData.sex === SEX.FEMALE ? newSpouse._id : person._id,
        state: relData?.state || RELATIONSHIP_STATE.MARRIED,
        marriageInfo: {
          startDate: relData?.marriageInfo?.startDate,
          endDate: relData?.marriageInfo?.endDate,
        },
        children: [],
      });

      // Save the relationship
      await newRelationship.save({ session });

      // Update existing person's relationships
      person.relationships.push(newRelationship._id);
      await person.save({ session });

      // Update new spouse's relationships
      newSpouse.relationships.push(newRelationship._id);
      await newSpouse.save({ session });

      // Commit the transaction
      await session.commitTransaction();

      return res.status(201).json({
        success: true,
        data: {
          person: {
            id: person._id,
            fullName: person.fullName,
            sex: person.sex,
          },
          spouse: {
            id: newSpouse._id,
            fullName: newSpouse.fullName,
            sex: newSpouse.sex,
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
  }

  static async addChild(req, res) {
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { relationshipId } = req.params;

      const { child: childData } = req.body;

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
      if (relationship.marriageInfo?.startDate && childData.birth?.date) {
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
        ...PersonService.makeFullInfo(childData),
        origin: relationshipId,
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
          relationship: {
            id: relationship._id,
            state: relationship.state,
            childrenCount: relationship.children.length,
          },
          child: {
            id: newChild._id,
            fullName: newChild.fullName,
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
  }

  static async updatePerson(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { personId } = req.params;

      const updateData = req.body;

      // Update person
      const updatedPerson = await Person.findByIdAndUpdate(
        personId,
        {
          $set: {
            fullName: updateData.fullName ?? undefined,
            sex: updateData.sex ?? undefined, // Note: sex usually shouldn't be changeable if person has relationships
            birth: {
              date: updateData.birth?.date ?? undefined,
              place: updateData.birth?.place ?? undefined,
            },
            isDead: updateData.isDead ?? undefined,
            death: {
              date: updateData.death?.date ?? undefined,
              place: updateData.death?.place ?? undefined,
            },
            contact: {
              address: updateData.contact?.address ?? undefined,
              email: updateData.contact?.email ?? undefined,
              phone: updateData.contact?.phone ?? undefined,
            },
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
  }

  static async updateRelsationship(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { relationshipId } = req.params;

      const updateData = req.body;

      // Update relationship
      const updatedRelationship = await Relationship.findByIdAndUpdate(
        relationshipId,
        {
          $set: {
            state: updateData.state ?? undefined,
            marriageInfo: {
              startDate: updateData.marriageInfo?.startDate || undefined,
              endDate: updateData.marriageInfo?.endDate || undefined,
            },
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
  }

  static async deletePerson(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { personId } = req.params;

      // Find the person with all their relationships
      const person = await Person.findById(personId)
        .populate("origin")
        .populate({
          path: "relationships",
          populate: {
            path: "husb wife",
          },
        });

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

        // Case 2: Person who has spouses without origin
        const SpousesWithoutOrigin = person.relationships
          .map((r) => (person.sex === SEX.MALE ? r.wife : r.husb))
          .filter((s) => !s.origin);

        if (SpousesWithoutOrigin.length > 0) {
          return {
            canDelete: false,
            reason: "Cannot delete person who has spouses without origin.",
            debug: SpousesWithoutOrigin,
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
        const spouse = rel.husb._id.equals(person._id) ? rel.wife : rel.husb;
        deletionSummary.relationships.push({
          id: rel._id,
          type: "spouse",
          otherSpouse: {
            id: spouse._id,
            fullName: spouse.fullName,
          },
        });

        // Remove relationship reference from the other spouse
        await Person.updateOne(
          { _id: spouse._id },
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
  }
}

module.exports = TreeController;
