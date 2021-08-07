const knex = require("../db/connection");

const courseName = "courses";

function list() {
    return knex(courseName)
        .select("*");
}

function create(course) {
    return knex(courseName)
        .insert(course)
        .returning("*");
}

function read(course_id) {
    return knex(courseName)
        .select("*")
        .where({ course_id: course_id })
        .first();
}

function readStudent(student_id) {
    return knex("students")
        .select("*")
        .where({ student_id: student_id })
        .first();
}

function occupy(course_id, student_id) {
    return knex(courseName)
        .where({ course_id: course_id })
        .update({ student_id: student_id, status: "occupied" });
}

function free(course_id) {
    return knex(courseName)
        .where({ course_id: course_id })
        .update({ student_id: null, status: "free" });
}

function updateStudent(student_id, status) {
    return knex("students")
        .where({ student_id: student_id })
        .update({ status: status });
}

module.exports = {
    list,
    create,
    read,
    occupy,
    free,
    readStudent,
    updateStudent,
}