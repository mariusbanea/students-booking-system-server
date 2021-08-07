const knex = require("../db/connection");

const courseName = "students";

function list(date, mobile_number) {
    if (date) {
        return knex(courseName)
            .select("*")
            .where({ student_date: date })
            .orderBy("student_time", "asc");
    }

    if (mobile_number) {
        return knex(courseName)
            .select("*")
            .where('mobile_number', 'like', `${mobile_number}%`);
    }

    return knex(courseName)
        .select("*");
}

function create(student) {
    return knex(courseName)
        .insert(student)
        .returning("*");
}

function read(student_id) {
    return knex(courseName)
        .select("*")
        .where({ student_id: student_id })
        .first();
}

function update(student_id, status) {
    return knex(courseName)
        .where({ student_id: student_id })
        .update({ status: status });
}

function edit(student_id, student) {
    return knex(courseName)
        .where({ student_id: student_id })
        .update({...student })
        .returning("*");
}

module.exports = {
    list,
    create,
    read,
    update,
    edit,
}