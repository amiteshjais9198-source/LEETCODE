const express = require("express");
const { createProblem, getAllProblems, getProblemById, submitSolution } = require("../controllers/userProblem");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/userMiddleware");

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.get("/", userMiddleware, getAllProblems);
problemRouter.get("/:id", userMiddleware, getProblemById);
problemRouter.post("/:id/submit", userMiddleware, submitSolution);

module.exports = problemRouter;