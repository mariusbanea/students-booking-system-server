const service = require("./students.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for student resources.
 */
async function list(req, res) {
    const date = req.query.date;
    const mobile_number = req.query.mobile_number;

    const students = await service.list(date, mobile_number);

    const response = students.filter((student) => student.status !== "finished");

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
    const requiredFields = ["first_name", "last_name", "mobile_number", "student_date", "student_time", "people"];

    for (const field of requiredFields) {
        if (!req.body.data.hasOwnProperty(field) || req.body.data[field] === "") {
            return next({ status: 400, message: `Field required: '${field}'` });
        }
    }

    if (Number.isNaN(Date.parse(`${req.body.data.student_date} ${req.body.data.student_time}`))) {
        return next({ status: 400, message: "'student_date' or 'student_time' field is in an incorrect format" });
    }

    if (typeof req.body.data.people !== "number") {
        return next({ status: 400, message: "'people' field must be a number" });
    }

    if (req.body.data.people < 1) {
        return next({ status: 400, message: "'people' field must be at least 1" });
    }

    if (req.body.data.status && req.body.data.status !== "booked") {
        return next({ status: 400, message: `'status' field cannot be ${req.body.data.status}` });
    }

    next();
}

/**
 * Validates the student date and time to ensure it fits with the restauraunt's schedule.
 */
async function validateDate(req, res, next) {
    const reserveDate = new Date(`${req.body.data.student_date}T${req.body.data.student_time}:00.000`);
    const todaysDate = new Date();

    if (reserveDate.getDay() === 2) {
        return next({ status: 400, message: "'student_date' field: restauraunt is closed on tuesday" });
    }

    if (reserveDate < todaysDate) {
        return next({ status: 400, message: "'student_date' and 'student_time' field must be in the future" });
    }

    if (reserveDate.getHours() < 10 || (reserveDate.getHours() === 10 && reserveDate.getMinutes() < 30)) {
        return next({ status: 400, message: "'student_time' field: mentoring is not open until 10:30AM" });
    }

    if (reserveDate.getHours() > 22 || (reserveDate.getHours() === 22 && reserveDate.getMinutes() >= 30)) {
        return next({ status: 400, message: "'student_time' field: mentoring is closed after 10:30PM" });
    }

    if (reserveDate.getHours() > 21 || (reserveDate.getHours() === 21 && reserveDate.getMinutes() > 30)) {
        return next({ status: 400, message: "'student_time' field: student must be made at least an hour before closing (10:30PM)" })
    }

    next();
}

/**
 * Create a student.
 */
async function create(req, res) {
    req.body.data.status = "booked";

    const response = await service.create(req.body.data);

    res.status(201).json({ data: response[0] });
}

/**
 * Validates, finds, and stores a student based off of its ID.
 */
async function validateStudentId(req, res, next) {
    const { student_id } = req.params;
    const student = await service.read(Number(student_id));

    if (!student) {
        return next({ status: 404, message: `student id ${student_id} does not exist` });
    }

    res.locals.student = student;

    next();
}

/**
 * Validates the body object to make sure all required information is correct for updating
 * a resevation's status.
 */
async function validateUpdateBody(req, res, next) {
    if (!req.body.data.status) {
        return next({ status: 400, message: "body must include a status field" });
    }

    if (req.body.data.status !== "booked" && req.body.data.status !== "seated" &&
        req.body.data.status !== "finished" && req.body.data.status !== "cancelled") {
        return next({ status: 400, message: `'status' field cannot be ${req.body.data.status}` });
    }

    if (res.locals.student.status === "finished") {
        return next({ status: 400, message: `a finished student cannot be updated` });
    }

    next();
}

/**
 * Update a student's status.
 */
async function update(req, res) {
    await service.update(res.locals.student.student_id, req.body.data.status);

    res.status(200).json({ data: { status: req.body.data.status } });
}

/**
 * Edit the data of a student.
 */
async function edit(req, res) {
    const response = await service.edit(res.locals.student.student_id, req.body.data);

    res.status(200).json({ data: response[0] });
}

/**
 * Respond with a particular student.
 */
async function read(req, res) {
    res.status(200).json({ data: res.locals.student });
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [asyncErrorBoundary(validateData), asyncErrorBoundary(validateBody), asyncErrorBoundary(validateDate), asyncErrorBoundary(create)],
    update: [asyncErrorBoundary(validateData), asyncErrorBoundary(validateStudentId), asyncErrorBoundary(validateUpdateBody), asyncErrorBoundary(update)],
    edit: [asyncErrorBoundary(validateData), asyncErrorBoundary(validateStudentId), asyncErrorBoundary(validateBody), asyncErrorBoundary(validateDate), asyncErrorBoundary(edit)],
    read: [asyncErrorBoundary(validateStudentId), asyncErrorBoundary(read)],
};