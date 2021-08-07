exports.up = function(knex) {
    return knex.schema.createTable("students", (table) => {
        table.increments("student_id").primary().notNullable();
        table.string("first_name").notNullable();
        table.string("last_name").notNullable();
        table.string("mobile_number").notNullable();
        table.date("student_date").notNullable();
        table.time("student_time").notNullable();
        table.integer("people").notNullable();
        table.string("status");
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("students");
};