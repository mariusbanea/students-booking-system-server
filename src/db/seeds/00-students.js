const students = require("./00-students.json");

exports.seed = function(knex) {
    return knex
        .raw("TRUNCATE TABLE students RESTART IDENTITY CASCADE")
        .then(() => knex("students").insert(students));;
};