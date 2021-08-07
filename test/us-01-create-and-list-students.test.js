const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

describe("US-01 - Create and list students", () => {
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

    describe("App", () => {
        describe("not found handler", () => {
            test("returns 404 for non-existent route", async() => {
                const response = await request(app)
                    .get("/fastidious")
                    .set("Accept", "application/json");

                expect(response.status).toBe(404);
                expect(response.body.error).toBe("Path not found: /fastidious");
            });
        });
    });

    describe("GET /students/:student_id", () => {
        test("returns 404 for non-existent id", async() => {
            const response = await request(app)
                .get("/students/99")
                .set("Accept", "application/json");

            expect(response.body.error).toContain("99");
            expect(response.status).toBe(404);
        });
    });

    describe("POST /students", () => {
        test("returns 400 if data is missing", async() => {
            const response = await request(app)
                .post("/students")
                .set("Accept", "application/json")
                .send({ datum: {} });

            expect(response.body.error).toBeDefined();
            expect(response.status).toBe(400);
        });

        test("returns 400 if first_name is missing", async() => {
            const data = {
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 1,
            };

            const response = await request(app)
                .post("/students")
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
                people: 1,
            };

            const response = await request(app)
                .post("/students")
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
                people: 1,
            };

            const response = await request(app)
                .post("/students")
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
                people: 1,
            };

            const response = await request(app)
                .post("/students")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("last_name");
            expect(response.status).toBe(400);
        });

        test("returns 400 if mobilePhone is missing", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 1,
            };

            const response = await request(app)
                .post("/students")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("mobile_number");
            expect(response.status).toBe(400);
        });

        test("returns 400 if mobilePhone is empty", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "",
                student_date: "2025-01-01",
                student_time: "13:30",
                people: 1,
            };

            const response = await request(app)
                .post("/students")
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
                .post("/students")
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
                .post("/students")
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
                people: 1,
            };

            const response = await request(app)
                .post("/students")
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
                people: 1,
            };

            const response = await request(app)
                .post("/students")
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
                people: 1,
            };

            const response = await request(app)
                .post("/students")
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
                people: 1,
            };

            const response = await request(app)
                .post("/students")
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
                .post("/students")
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
                .post("/students")
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
                .post("/students")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toContain("people");
            expect(response.status).toBe(400);
        });

        test("returns 201 if data is valid", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "17:30",
                people: 2,
            };

            const response = await request(app)
                .post("/students")
                .set("Accept", "application/json")
                .send({ data });

            expect(response.body.error).toBeUndefined();
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    first_name: "first",
                    last_name: "last",
                    mobile_number: "800-555-1212",
                    student_date: expect.stringContaining("2025-01-01"),
                    student_time: expect.stringContaining("17:30"),
                    people: 2,
                })
            );
            expect(response.status).toBe(201);
        });
    });

    describe("GET /students", () => {
        test("returns only students matching date query parameter", async() => {
            const response = await request(app)
                .get("/students?date=2020-12-31")
                .set("Accept", "application/json");

            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].first_name).toBe("Rick");
            expect(response.status).toBe(200);
        });
        test("returns students sorted by time (earliest time first)", async() => {
            const response = await request(app)
                .get("/students?date=2020-12-30")
                .set("Accept", "application/json");

            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].first_name).toBe("Bird");
            expect(response.body.data[1].first_name).toBe("Frank");
            expect(response.status).toBe(200);
        });
    });
});