exports.seed = function(knex) {
    return knex
        .raw("TRUNCATE TABLE courses RESTART IDENTITY CASCADE")
        .then(function() {
            // Inserts seed entries
            return knex('courses').insert([
                { course_name: "#1", capacity: 6, status: "free" },
                { course_name: "#2", capacity: 6, status: "free" },
                { course_name: "Bar #1", capacity: 1, status: "free" },
                { course_name: "Bar #2", capacity: 1, status: "free" },
            ]);
        });
};