const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const studentsRouter = require("./students/students.router");
const coursesRouter = require("./courses/courses.router");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/students", studentsRouter);
app.use("/courses", coursesRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;