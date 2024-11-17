const express = require("express");
const router = express.Router();

const ValidationMiddleware = require("../middlewares/validation");
const TreeController = require("../controllers/treeController");

router.get("/", TreeController.getTree);
/* Request & Response
* Request Body:
{}

* Response Shape:
{success: false, error}

OR

{
  success: true,
  data: {
    people: [{id, fullName, sex, birthYear?, isDead, deathYear?, origin?, relationships?: [id, ...]}, ...],
    relationships: [{id, state, husb, wife, children?: [id, ...]}, ...]
  },
}
*/

router.get(
  "/person/:personId",
  ValidationMiddleware.validatePersonId,
  TreeController.getPerson
);
/* Request & Response
* Request Body:
{}

* Response Shape:
{success: false, error}

OR

{
  success: true,
  data: {
    person: {
      id, fullName, sex, birth?: {date?, place?}, isDead, death?: {date?, place?}, contact?: {address?, email?, phone?},
      origin?: {
        id, state,
        husb: {id, fullName, sex, birthYear?, isDead, deathYear?},
        wife: {id, fullName, sex, birthYear?, isDead, deathYear?}
      }
      relationships?: [{
        id, state, marriageInfo?: {startDate?, endDate?},
        spouse: {id, fullName, sex, birthYear?, isDead, deathYear?},
        children?: [{id, fullName, sex, birthYear?, isDead, deathYear?}, ...]
      }, ...],
    }
  }
}
*/

router.post(
  "/init-tree",
  ValidationMiddleware.validateInitialTreeData,
  TreeController.initTree
);
/* Request & Response
* Request Body:
{
  grandFather: {fullName, birth?: {date?, place?}, isDead=false, death?: {date?, place?}, contact?: {address?, email?, phone?}},
  grandMother: {fullName, birth?: {date?, place?}, isDead=false, death?: {date?, place?}, contact?: {address?, email?, phone?}},
  relationship?: {state='married', marriageInfo?: {startDate?, endDate?}}
}

* Response Shape:
{success: false, error, details?}

OR

{
  success: true,
  data: {
    rootRelationship: {id, state},
    grandFather: {id, fullName},
    grandMother: {id, fullName},
  }
}
*/

router.post(
  "/spouse/:personId",
  ValidationMiddleware.validatePersonId,
  ValidationMiddleware.validateSpouseData,
  TreeController.addSpouse
);
/* Request & Response
* Request Body:
{
  spouse: {fullName, birth?: {date?, place?}, isDead=false, death?: {date?, place?}, contact?: {address?, email?, phone?}},
  relationship?: {state='married', marriageInfo?: {startDate?, endDate?}}
}
* Response Shape:
{success: false, error, details?}

OR

{
  success: true,
  data: {
    person: {id, fullName, sex},
    spouse: {id, fullName, sex},
    relationship: {id, state}
  }
}
*/

router.post(
  "/child/:relationshipId",
  ValidationMiddleware.validateRelationshipId,
  ValidationMiddleware.validateChildData,
  TreeController.addChild
);
/* Request & Response
* Request Body:
{
  child: {fullName, sex, birth?: {date?, place?}, isDead=false, death?: {date?, place?}, contact?: {address?, email?, phone?}},
}
* Response Shape:
{success: false, error, details?}

OR

{
  success: true,
  data: {
    relationship: {id, state, childrenCount}
    child: {id, fullName},
  }
}
*/

router.put(
  "/person/:personId",
  ValidationMiddleware.validatePersonId,
  TreeController.updatePerson
);

router.put(
  "/relationship/:relationshipId",
  ValidationMiddleware.validateRelationshipId,
  TreeController.updateRelsationship
);

router.delete(
  "/person/:personId",
  ValidationMiddleware.validatePersonId,
  TreeController.deletePerson
);

module.exports = router;
