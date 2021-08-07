const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

describe("US-08 - Change an existing student", () => {
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

    describe("PUT /students/:student_id", () => {
        test("returns 404 if student does not exist", async() => {
            const data = {
                first_name: "Mouse",
                last_name: "Whale",
                mobile_number: "1231231235",
                student_date: "2026-12-30",
                student_time: "18:00",
                people: 2,
            };

            const response = await request(app)
                .put("/students/999999")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).not.toBeUndefined();
            expect(response.status).toBe(404);
        });

        test("updates the student", async() => {
            const expected = {
                first_name: "Mouse",
                last_name: "Whale",
                mobile_number: "1231231235",
                student_date: "2026-12-30",
                student_time: "18:00",
                people: 2,
            };

            const student = await knex("students")
                .where("student_id", 1)
                .first();

            expect(student).not.toBeUndefined();

            Object.entries(expected).forEach(
                ([key, value]) => (student[key] = value)
            );

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data: student });

            expect(response.body.error).toBeUndefined();
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    ...expected,
                    student_date: expect.stringMatching(expected.student_date),
                    student_time: expect.stringMatching(expected.student_time),
                })
            );
            expect(response.status).toBe(200);
        });

        test("returns 400 if first_name is missing", async() => {
            const data = {
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 3,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("first_name");
            expect(response.status).toBe(400);
        });

        test("returns 400 if first_name is empty", async() => {
            const data = {
                first_name: "",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 3,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("first_name");
            expect(response.status).toBe(400);
        });

        test("returns 400 if last_name is missing", async() => {
            const data = {
                first_name: "first",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 3,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("last_name");
            expect(response.status).toBe(400);
        });

        test("returns 400 if last_name is empty", async() => {
            const data = {
                first_name: "first",
                last_name: "",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 3,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("last_name");
            expect(response.status).toBe(400);
        });

        test("returns 400 if mobile_phone is missing", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 3,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("mobile_number");
            expect(response.status).toBe(400);
        });

        test("returns 400 if mobile_phone is empty", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 3,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("mobile_number");
            expect(response.status).toBe(400);
        });

        test("returns 400 if student_date is missing", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_time: "13:30",
                people: 1,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("student_date");
            expect(response.status).toBe(400);
        });

        test("returns 400 if student_date is empty", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "",
                student_time: "13:30",
                people: 1,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("student_date");
            expect(response.status).toBe(400);
        });
        test("returns 400 if student_date is not a date", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "not-a-date",
                student_time: "13:30",
                people: 2,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("student_date");
            expect(response.status).toBe(400);
        });

        test("returns 400 if student_time is missing", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                people: 2,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("student_time");
            expect(response.status).toBe(400);
        });
        test("returns 400 if student_time is empty", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "",
                people: 2,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("student_time");
            expect(response.status).toBe(400);
        });
        test("returns 400 if student_time is not a time", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "not-a-time",
                people: 2,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("student_time");
        });

        test("returns 400 if people is missing", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "17:30",
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("people");
            expect(response.status).toBe(400);
        });

        test("returns 400 if people is zero", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "17:30",
                people: 0,
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("people");
            expect(response.status).toBe(400);
        });

        test("returns 400 if people is not a number", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "17:30",
                people: "2",
            };

            const response = await request(app)
                .put("/students/1")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("people");
            expect(response.status).toBe(400);
        });
    });

    describe("PUT /students/:student_id/status", () => {
        test("returns 200 for status cancelled", async() => {
            const student = await knex("students")
                .orderBy(["student_date", "student_time"])
                .first();

            expect(student).not.toBeUndefined();

            const status = "cancelled";

            const response = await request(app)
                .put(`/students/${student.student_id}/status`)
                .set("Accept", "application/json")
                .send({ data: { status } });

            expect(response.body.data).toHaveProperty("status", status);
            expect(response.status).toBe(200);
        });
    });
});