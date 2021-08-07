/**
 * Defines the router for student resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./students.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
    .route("/:student_id/status")
    .put(controller.update)
    .all(methodNotAllowed);

router
    .route("/:student_id")
    .get(controller.read)
    .put(controller.edit)
    .all(methodNotAllowed);

router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

module.exports = router;