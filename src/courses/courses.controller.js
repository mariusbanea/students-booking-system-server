const service = require("./courses.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for course resources.
 */
async function list(req, res) {
    const response = await service.list();

    res.json({ data: response });
}

/**
 * Makes sure data object exists.
 */
async function validateData(req, res, next) {
    if (!req.body.data) {
        return next({ status: 400, message: "Body must include a data object" });
    }

    next();
}

/**
 * Validates the body object to make sure all required information is correct.
 */
async function validateBody(req, res, next) {
    if (!req.body.data.course_name || req.body.data.course_name === "") {
        return next({ status: 400, message: "'course_name' field cannot be empty" });
    }

    if (req.body.data.course_name.length < 2) {
        return next({ status: 400, message: "'course_name' field must be at least 2 characters" });
    }

    if (!req.body.data.capacity || req.body.data.capacity === "") {
        return next({ status: 400, message: "'capacity' field cannot be empty" });
    }

    if (typeof req.body.data.capacity !== "number") {
        return next({ status: 400, message: "'capacity' field must be a number" });
    }

    if (req.body.data.capacity < 1) {
        return next({ status: 400, message: "'capacity' field must be at least 1" });
    }

    next();
}

/**
 * Create a course.
 */
async function create(req, res) {
    if (req.body.data.student_id) {
        req.body.data.status = "occupied";
        await service.updateStudent(req.body.data.student_id, "seated");
    } else {
        req.body.data.status = "free";
    }

    const response = await service.create(req.body.data);

    res.status(201).json({ data: response[0] });
}

/**
 * Validates, finds, and stores a student based off of its ID.
 */
async function validateStudentId(req, res, next) {
    const { student_id } = req.body.data;

    if (!student_id) {
        return next({ status: 400, message: `student_id field must be included in the body` });
    }

    const student = await service.readStudent(Number(student_id));

    if (!student) {
        return next({ status: 404, message: `student_id ${student_id} does not exist` });
    }

    res.locals.student = student;

    next();
}

/**
 * Validates a seat request to make sure it is allowed.
 */
async function validateSeat(req, res, next) {
    if (res.locals.course.status === "occupied") {
        return next({ status: 400, message: "the course you selected is currently occupied" });
    }

    if (res.locals.student.status === "seated") {
        return next({ status: 400, message: "the student you selected is already seated" });
    }

    if (res.locals.course.capacity < res.locals.student.people) {
        return next({ status: 400, message: `the course you selected does not have enough capacity to seat ${res.locals.student.people} people` });
    }

    next();
}

/**
 * Seat a course.
 */
async function update(req, res) {
    await service.occupy(res.locals.course.course_id, res.locals.student.student_id);
    await service.updateStudent(res.locals.student.student_id, "seated");

    res.status(200).json({ data: { status: "seated" } });
}

/**
 * Validates, finds, and stores a course based off of its ID.
 */
async function validateCourseId(req, res, next) {
    const { course_id } = req.params;
    const course = await service.read(course_id);

    if (!course) {
        return next({ status: 404, message: `course id ${course_id} does not exist` });
    }

    res.locals.course = course;

    next();
}

/**
 * Makes sure course is occupied before seating a course.
 */
async function validateSeatedCourse(req, res, next) {
    if (res.locals.course.status !== "occupied") {
        return next({ status: 400, message: "this course is not occupied" });
    }

    next();
}

/**
 * Finish a course.
 */
async function destroy(req, res) {
    await service.updateStudent(res.locals.course.student_id, "finished");
    await service.free(res.locals.course.course_id);

    res.status(200).json({ data: { status: "finished" } });
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [asyncErrorBoundary(validateData), asyncErrorBoundary(validateBody), asyncErrorBoundary(create)],
    update: [asyncErrorBoundary(validateData), asyncErrorBoundary(validateCourseId), asyncErrorBoundary(validateStudentId), asyncErrorBoundary(validateSeat), asyncErrorBoundary(update)],
    destroy: [asyncErrorBoundary(validateCourseId), asyncErrorBoundary(validateSeatedCourse), asyncErrorBoundary(destroy)],
};