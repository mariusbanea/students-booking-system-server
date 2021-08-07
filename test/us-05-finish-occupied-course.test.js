const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

describe("US-05 - Finish an occupied course", () => {
    beforeAll(() => {
        return knex.migrate
            .forceFreeMigrationsLock()
            .then(() => knex.migrate.rollback(null, true))
            .then(() => knex.migrate.latest());
    });

    beforeEach(() => {
        return knex.seed.run();
    });

    afterAll(async() => {
        return await knex.migrate.rollback(null, true).then(() => knex.destroy());
    });

    describe("DELETE /courses/:course_id/seat", () => {
        let barCourseOne;
        let courseOne;

        beforeEach(async() => {
            barCourseOne = await knex("courses").where("course_name", "Bar #1").first();
            courseOne = await knex("courses").where("course_name", "#1").first();
        });

        test("returns 404 for non-existent course_id", async() => {
            const response = await request(app)
                .delete("/courses/99/seat")
                .set("Accept", "application/json")
                .send({ datum: {} });

            expect(response.body.error).toContain("99");
            expect(response.status).toBe(404);
        });

        test("returns 400 if course_id is not occupied.", async() => {
            const response = await request(app)
                .delete("/courses/1/seat")
                .set("Accept", "application/json")
                .send({});

            expect(response.body.error).toContain("not occupied");
            expect(response.status).toBe(400);
        });

        test("returns 200 if course_id is occupied ", async() => {
            expect(courseOne).not.toBeUndefined();

            const seatResponse = await request(app)
                .put(`/courses/${courseOne.course_id}/seat`)
                .set("Accept", "application/json")
                .send({ data: { student_id: 1 } });

            expect(seatResponse.body.error).toBeUndefined();
            expect(seatResponse.status).toBe(200);

            const finishResponse = await request(app)
                .delete(`/courses/${courseOne.course_id}/seat`)
                .set("Accept", "application/json");

            expect(finishResponse.body.error).toBeUndefined();
            expect(finishResponse.status).toBe(200);
        });
    });
});