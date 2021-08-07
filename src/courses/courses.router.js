/**
 * Defines the router for student resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./courses.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
    .route("/:course_id/seat")
    .put(controller.update)
    .delete(controller.destroy)
    .all(methodNotAllowed);

router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

module.exports = router;