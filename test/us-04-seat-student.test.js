const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

describe("US-04 - Seat student", () => {
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

    describe("Create and list courses", () => {
        describe("GET /courses/:course_id", () => {
            test("returns 404 for non-existent id", async() => {
                const response = await request(app)
                    .get("/courses/99999")
                    .set("Accept", "application/json");

                expect(response.body.error).toContain("99999");
                expect(response.status).toBe(404);
            });
        });

        describe("POST /courses", () => {
            test("returns 400 if data is missing", async() => {
                const response = await request(app)
                    .post("/courses")
                    .set("Accept", "application/json")
                    .send({ datum: {} });

                expect(response.body.error).toBeDefined();
                expect(response.status).toBe(400);
            });

            test("returns 400 if course_name is missing", async() => {
                const data = {
                    capacity: 1,
                };

                const response = await request(app)
                    .post("/courses")
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain("course_name");
                expect(response.status).toBe(400);
            });

            test("returns 400 if course_name is empty", async() => {
                const data = {
                    course_name: "",
                    capacity: 1,
                };

                const response = await request(app)
                    .post("/courses")
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain("course_name");
                expect(response.status).toBe(400);
            });

            test("returns 400 if course_name is one character", async() => {
                const data = {
                    course_name: "A",
                    capacity: 1,
                };

                const response = await request(app)
                    .post("/courses")
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain("course_name");
                expect(response.status).toBe(400);
            });

            test("returns 400 if capacity is missing", async() => {
                const data = {
                    course_name: "course name",
                };

                const response = await request(app)
                    .post("/courses")
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain("capacity");
                expect(response.status).toBe(400);
            });

            test("returns 400 if capacity is zero", async() => {
                const data = {
                    course_name: "course name",
                    capacity: 0,
                };

                const response = await request(app)
                    .post("/courses")
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain("capacity");
                expect(response.status).toBe(400);
            });

            test("returns 400 if capacity is not a number", async() => {
                const data = {
                    course_name: "course name",
                    people: "2",
                };

                const response = await request(app)
                    .post("/courses")
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain("capacity");
                expect(response.status).toBe(400);
            });

            test("returns 201 if course is created", async() => {
                const data = {
                    course_name: "course-name",
                    capacity: 1,
                };

                const response = await request(app)
                    .post("/courses")
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toBeUndefined();
                expect(response.body.data).toEqual(expect.objectContaining(data));
                expect(response.status).toBe(201);
            });
        });

        describe("GET /courses", () => {
            test("returns all courses sorted by course name", async() => {
                const response = await request(app)
                    .get("/courses")
                    .set("Accept", "application/json");

                expect(response.body.error).toBeUndefined();
                expect(response.body.data).toHaveLength(4);
                expect(response.body.data[0].course_name).toBe("#1");
                expect(response.body.data[1].course_name).toBe("#2");
                expect(response.body.data[2].course_name).toBe("Bar #1");
                expect(response.body.data[3].course_name).toBe("Bar #2");
                expect(response.status).toBe(200);
            });
        });
    });

    describe("Read student", () => {
        describe("GET /students/:student_Id", () => {
            test("returns 200 for an existing id", async() => {
                const response = await request(app)
                    .get("/students/1")
                    .set("Accept", "application/json");

                expect(response.body.error).toBeUndefined();
                expect(response.body.data.student_id).toBe(1);
                expect(response.status).toBe(200);
            });
        });
    });

    describe("Seat student", () => {
        let barCourseOne;
        let courseOne;

        beforeEach(async() => {
            barCourseOne = await knex("courses").where("course_name", "Bar #1").first();
            courseOne = await knex("courses").where("course_name", "#1").first();
        });

        describe("PUT /courses/:course_id/seat", () => {
            test("returns 400 if data is missing", async() => {
                expect(courseOne).not.toBeUndefined();

                const response = await request(app)
                    .put(`/courses/${courseOne.course_id}/seat`)
                    .set("Accept", "application/json")
                    .send({ datum: {} });

                expect(response.body.error).toBeDefined();
                expect(response.status).toBe(400);
            });

            test("returns 400 if student_id is missing", async() => {
                expect(courseOne).not.toBeUndefined();
                const data = {};

                const response = await request(app)
                    .put(`/courses/${courseOne.course_id}/seat`)
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain("student_id");
                expect(response.status).toBe(400);
            });

            test("returns 404 if student_id does not exist", async() => {
                expect(courseOne).not.toBeUndefined();

                const data = {
                    student_id: 999,
                };

                const response = await request(app)
                    .put(`/courses/${courseOne.course_id}/seat`)
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain("999");
                expect(response.status).toBe(404);
            });

            test("returns 200 if course has sufficient capacity", async() => {
                expect(courseOne).not.toBeUndefined();

                const response = await request(app)
                    .put(`/courses/${courseOne.course_id}/seat`)
                    .set("Accept", "application/json")
                    .send({ data: { student_id: 1 } });

                expect(response.body.error).toBeUndefined();
                expect(response.status).toBe(200);
            });
            test("returns 400 if course does not have sufficient capacity", async() => {
                expect(barCourseOne).not.toBeUndefined();

                const response = await request(app)
                    .put(`/courses/${barCourseOne.course_id}/seat`)
                    .set("Accept", "application/json")
                    .send({ data: { student_id: 1 } });

                expect(response.body.error).toContain("capacity");
                expect(response.status).toBe(400);
            });

            test("returns 400 if course is occupied", async() => {
                expect(courseOne).not.toBeUndefined();

                // first, occupy the course
                const occupyResponse = await request(app)
                    .put(`/courses/${courseOne.course_id}/seat`)
                    .set("Accept", "application/json")
                    .send({ data: { student_id: 1 } });

                expect(occupyResponse.body.error).toBeUndefined();
                expect(occupyResponse.status).toBe(200);

                // next, try to assign the course to another student
                const doubleAssignResponse = await request(app)
                    .put(`/courses/${courseOne.course_id}/seat`)
                    .set("Accept", "application/json")
                    .send({ data: { student_id: 2 } });

                expect(doubleAssignResponse.body.error).toContain("occupied");
                expect(doubleAssignResponse.status).toBe(400);
            });
        });
    });
});