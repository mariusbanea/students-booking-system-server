exports.up = function(knex) {
    return knex.schema.createTable("courses", (table) => {
        table.increments("course_id").primary().notNullable();
        table.string("course_name").notNullable();
        table.integer("capacity").notNullable();
        table.string("status").notNullable();
        table.integer("student_id").unsigned();
        table.foreign("student_id")
            .references("student_id")
            .inTable("students")
            .onDelete("SET NULL");
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("courses");
};