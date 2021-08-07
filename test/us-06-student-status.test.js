const request = require("supertest");

const app = require("../src/app");
const knex = require("../src/db/connection");

describe("US-06 - Student status", () => {
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

    describe("POST /students", () => {
        test("returns 201 if status is 'booked'", async() => {
            const data = {
                first_name: "first",
                last_name: "last",
                mobile_number: "800-555-1212",
                student_date: "2025-01-01",
                student_time: "17:30",
                people: 2,
                status: "booked",
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

        test.each(["seated", "finished"])(
            "returns 400 if status is '%s'",
            async(status) => {
                const data = {
                    first_name: "first",
                    last_name: "last",
                    mobile_number: "800-555-1212",
                    student_date: "2025-01-01",
                    student_time: "17:30",
                    people: 2,
                    status,
                };

                const response = await request(app)
                    .post("/students")
                    .set("Accept", "application/json")
                    .send({ data });

                expect(response.body.error).toContain(status);
                expect(response.status).toBe(400);
            }
        );
    });

    describe("PUT /students/:student_id/status", () => {
        let studentOne;
        let studentTwo;

        beforeEach(async() => {
            [studentOne, studentTwo] = await knex("students").orderBy([
                "student_date",
                "student_time",
            ]);
        });

        test("returns 404 for non-existent student_id", async() => {
            const response = await request(app)
                .put("/students/99/status")
                .set("Accept", "application/json")
                .send({ data: { status: "seated" } });

            expect(response.body.error).toContain("99");
            expect(response.status).toBe(404);
        });

        test("returns 400 for unknown status", async() => {
            expect(studentOne).not.toBeUndefined();

            const response = await request(app)
                .put(`/students/${studentOne.student_id}/status`)
                .set("Accept", "application/json")
                .send({ data: { status: "unknown" } });

            expect(response.body.error).toContain("unknown");
            expect(response.status).toBe(400);
        });

        test("returns 400 if status is currently finished (a finished student cannot be updated)", async() => {
            expect(studentOne).not.toBeUndefined();

            studentOne.status = "finished";
            await knex("students")
                .where({ student_id: studentOne.student_id })
                .update(studentOne, "*");

            const response = await request(app)
                .put(`/students/${studentOne.student_id}/status`)
                .set("Accept", "application/json")
                .send({ data: { status: "seated" } });

            expect(response.body.error).toContain("finished");
            expect(response.status).toBe(400);
        });

        test.each(["booked", "seated", "finished"])(
            "returns 200 for status '%s'",
            async(status) => {
                expect(studentOne).not.toBeUndefined();

                const response = await request(app)
                    .put(`/students/${studentOne.student_id}/status`)
                    .set("Accept", "application/json")
                    .send({ data: { status } });

                expect(response.body.data).toHaveProperty("status", status);
                expect(response.status).toBe(200);
            }
        );
    });

    describe("PUT /courses/:course_id/seat", () => {
        let studentOne;
        let courseOne;
        let courseTwo;

        beforeEach(async() => {
            studentOne = await knex("students")
                .orderBy(["student_date", "student_time"])
                .first();
            [courseOne, courseTwo] = await knex("courses").orderBy("course_name");
        });

        test("returns 200 and changes student status to 'seated'", async() => {
            expect(courseOne).not.toBeUndefined();
            expect(studentOne).not.toBeUndefined();

            const seatResponse = await request(app)
                .put(`/courses/${courseOne.course_id}/seat`)
                .set("Accept", "application/json")
                .send({ data: { student_id: studentOne.student_id } });

            expect(seatResponse.body.error).toBeUndefined();
            expect(seatResponse.status).toBe(200);

            const studentResponse = await request(app)
                .get(`/students/${studentOne.student_id}`)
                .set("Accept", "application/json");

            expect(studentResponse.body.error).toBeUndefined();
            expect(studentResponse.body.data).toHaveProperty("status", "seated");
            expect(studentResponse.status).toBe(200);
        });

        test("returns 400 if student is already 'seated'", async() => {
            expect(courseOne).not.toBeUndefined();
            expect(studentOne).not.toBeUndefined();

            const firstSeatResponse = await request(app)
                .put(`/courses/${courseOne.course_id}/seat`)
                .set("Accept", "application/json")
                .send({ data: { student_id: studentOne.student_id } });

            expect(firstSeatResponse.body.error).toBeUndefined();
            expect(firstSeatResponse.status).toBe(200);

            const secondSeatResponse = await request(app)
                .put(`/courses/${courseTwo.course_id}/seat`)
                .set("Accept", "application/json")
                .send({ data: { student_id: studentOne.student_id } });

            expect(secondSeatResponse.body.error).toContain("seated");
            expect(secondSeatResponse.status).toBe(400);
        });
    });

    describe("DELETE /courses/:course_id/seat", () => {
        let studentOne;
        let courseOne;

        beforeEach(async() => {
            studentOne = await knex("students")
                .orderBy(["student_date", "student_time"])
                .first();
            courseOne = await knex("courses").orderBy("course_name").first();
        });

        test("returns 200 and changes student status to 'finished'", async() => {
            expect(courseOne).not.toBeUndefined();
            expect(studentOne).not.toBeUndefined();

            const seatResponse = await request(app)
                .put(`/courses/${courseOne.course_id}/seat`)
                .set("Accept", "application/json")
                .send({ data: { student_id: studentOne.student_id } });

            expect(seatResponse.body.error).toBeUndefined();
            expect(seatResponse.status).toBe(200);

            const finishResponse = await request(app)
                .delete(`/courses/${courseOne.course_id}/seat`)
                .set("Accept", "application/json")
                .send({ data: { student_id: studentOne.student_id } });

            expect(finishResponse.body.error).toBeUndefined();
            expect(finishResponse.status).toBe(200);

            const studentResponse = await request(app)
                .get(`/students/${studentOne.student_id}`)
                .set("Accept", "application/json");

            expect(studentResponse.body.error).toBeUndefined();
            expect(studentResponse.body.data).toHaveProperty(
                "status",
                "finished"
            );
            expect(studentResponse.status).toBe(200);
        });
    });

    describe("GET /students/date=XXXX-XX-XX", () => {
        let studentOne;
        let courseOne;

        beforeEach(async() => {
            studentOne = await knex("students")
                .orderBy(["student_date", "student_time"])
                .first();
            courseOne = await knex("courses").orderBy("course_name").first();
        });

        test("does not include 'finished' students", async() => {
            expect(courseOne).not.toBeUndefined();
            expect(studentOne).not.toBeUndefined();

            const seatResponse = await request(app)
                .put(`/courses/${courseOne.course_id}/seat`)
                .set("Accept", "application/json")
                .send({ data: { student_id: studentOne.student_id } });

            expect(seatResponse.body.error).toBeUndefined();
            expect(seatResponse.status).toBe(200);

            const finishResponse = await request(app)
                .delete(`/courses/${courseOne.course_id}/seat`)
                .set("Accept", "application/json")
                .send({ data: { student_id: studentOne.student_id } });

            expect(finishResponse.body.error).toBeUndefined();
            expect(finishResponse.status).toBe(200);

            const studentsResponse = await request(app)
                .get(
                    `/students?date=${asDateString(studentOne.student_date)}`
                )
                .set("Accept", "application/json");

            expect(studentsResponse.body.error).toBeUndefined();

            const finishedStudents = studentsResponse.body.data.filter(
                (student) => student.status === "finished"
            );

            expect(finishedStudents).toHaveLength(0);
        });
    });
});

function asDateString(date) {
    return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${date.getDate().toString(10).padStart(2, "0")}`;
}