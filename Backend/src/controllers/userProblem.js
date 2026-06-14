const { evaluateSubmission } = require("../utilis/problemUtility");
const Problem = require("../model/problem");

// Create a new problem (Admin only, verifies reference solutions)
const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases,
        referenceSolution, startCode } = req.body;

    try {
        const allTestCases = [...visibleTestCases, ...hiddenTestCases];

        for (const { language, completeCode } of referenceSolution) {
            const result = await evaluateSubmission(language, completeCode, allTestCases);
            
            if (result.status.id !== 3) { // 3 = Accepted
                return res.status(400).json({
                    success: false,
                    message: `Reference solution verification failed for ${language}! Status: ${result.status.description}`,
                    error: result.compile_output || result.stdout
                });
            }
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        return res.status(201).json({
            success: true,
            message: "Problem created successfully",
            data: userProblem
        });

    } catch (err) {
        console.error("Error creating problem:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error during problem creation" 
        });
    }
}

// Get all problems (omits hidden test cases and solutions for security)
const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}, '-hiddenTestCases -referenceSolution');
        return res.status(200).json({
            success: true,
            data: problems
        });
    } catch (err) {
        console.error("Error fetching all problems:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching problems"
        });
    }
}

// Get specific problem by ID (omits hidden test cases and solutions)
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id, '-hiddenTestCases -referenceSolution');
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        console.error("Error fetching problem by ID:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching problem details"
        });
    }
}

// Submit user solution for evaluation
const submitSolution = async (req, res) => {
    const { language, code } = req.body;
    const problemId = req.params.id;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const allTestCases = [...problem.visibleTestCases, ...problem.hiddenTestCases];

        // Evaluate code
        const result = await evaluateSubmission(language, code, allTestCases);

        // If Accepted, append problem ID to user's solved list
        if (result.status.id === 3) {
            const user = req.result;
            if (!user.problemSolved.includes(problemId)) {
                user.problemSolved.push(problemId);
                await user.save();
            }
        }

        // Return Judge0-compliant response format directly
        return res.status(200).json(result);

    } catch (err) {
        console.error("Error executing user submission:", err);
        return res.status(500).json({
            success: false,
            message: "Internal error processing submission"
        });
    }
}

module.exports = { createProblem, getAllProblems, getProblemById, submitSolution };
