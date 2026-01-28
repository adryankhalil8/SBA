// ========================================
// SBA 308 - JavaScript Fundamentals
// Learner Data Processing System
// ========================================

// Sample data for testing
const CourseInfo = {
    id: 451,
    name: "Introduction to JavaScript"
};

const AssignmentGroup = {
    id: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 451,
    group_weight: 25,
    assignments: [
        {
            id: 1,
            name: "Declare a Variable",
            due_at: "2023-01-25",
            points_possible: 50
        },
        {
            id: 2,
            name: "Write a Function",
            due_at: "2023-02-27",
            points_possible: 150
        },
        {
            id: 3,
            name: "Code the World",
            due_at: "3156-11-15",
            points_possible: 500
        }
    ]
};

const LearnerSubmissions = [
    {
        learner_id: 125,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-25",
            score: 47
        }
    },
    {
        learner_id: 125,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-02-12",
            score: 150
        }
    },
    {
        learner_id: 125,
        assignment_id: 3,
        submission: {
            submitted_at: "2023-01-25",
            score: 400
        }
    },
    {
        learner_id: 132,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-24",
            score: 39
        }
    },
    {
        learner_id: 132,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-03-07",
            score: 140
        }
    }
];

// ========================================
// Helper Functions
// ========================================

/**
 * Validates if a value is a valid number
 * @param {*} value - Value to validate
 * @returns {boolean}
 */
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Validates if a date string is valid and converts to Date object
 * @param {string} dateString - Date string to validate
 * @returns {Date|null}
 */
function parseDate(dateString) {
    try {
        if (typeof dateString !== 'string') {
            throw new Error("Date must be a string");
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date format");
        }
        return date;
    } catch (error) {
        console.warn(`Date parsing error: ${error.message}`);
        return null;
    }
}

/**
 * Checks if an assignment is past due
 * @param {string} dueDate - Due date string
 * @returns {boolean}
 */
function isAssignmentDue(dueDate) {
    const due = parseDate(dueDate);
    if (!due) return false;

    const now = new Date();
    return due <= now;
}

/**
 * Checks if a submission was late
 * @param {string} submittedAt - Submission date string
 * @param {string} dueAt - Due date string
 * @returns {boolean}
 */
function isSubmissionLate(submittedAt, dueAt) {
    const submitted = parseDate(submittedAt);
    const due = parseDate(dueAt);

    if (!submitted || !due) return false;

    return submitted > due;
}

/**
 * Finds an assignment by ID
 * @param {Array} assignments - Array of assignment objects
 * @param {number} assignmentId - ID to search for
 * @returns {Object|null}
 */
function findAssignmentById(assignments, assignmentId) {
    // Using for...of loop (requirement: at least 2 different loop types)
    for (const assignment of assignments) {
        if (assignment.id === assignmentId) {
            return assignment;
        }
    }
    return null;
}

/**
 * Validates the assignment group belongs to the course
 * @param {Object} courseInfo - Course information object
 * @param {Object} assignmentGroup - Assignment group object
 * @throws {Error} If course IDs don't match
 */
function validateCourseMatch(courseInfo, assignmentGroup) {
    if (!courseInfo || !assignmentGroup) {
        throw new Error("Course info and assignment group are required");
    }

    if (!isValidNumber(courseInfo.id) || !isValidNumber(assignmentGroup.course_id)) {
        throw new Error("Course IDs must be valid numbers");
    }

    if (courseInfo.id !== assignmentGroup.course_id) {
        throw new Error(
            `Assignment group does not belong to course. ` +
            `Course ID: ${courseInfo.id}, Assignment Group Course ID: ${assignmentGroup.course_id}`
        );
    }
}

/**
 * Validates assignment data
 * @param {Object} assignment - Assignment object to validate
 * @returns {boolean}
 */
function validateAssignment(assignment) {
    try {
        // Check if assignment exists
        if (!assignment) return false;

        // Check if points_possible is valid and not zero
        if (!isValidNumber(assignment.points_possible)) {
            console.warn(`Invalid points_possible for assignment ${assignment.id}`);
            return false;
        }

        // Cannot divide by zero
        if (assignment.points_possible === 0) {
            console.warn(`Assignment ${assignment.id} has zero points possible - skipping`);
            return false;
        }

        // Check for negative points
        if (assignment.points_possible < 0) {
            console.warn(`Assignment ${assignment.id} has negative points - skipping`);
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Error validating assignment: ${error.message}`);
        return false;
    }
}

/**
 * Calculates the score for a submission with late penalty if applicable
 * @param {Object} submission - Submission object
 * @param {Object} assignment - Assignment object
 * @returns {number}
 */
function calculateScore(submission, assignment) {
    let score = submission.submission.score;

    // Validate score is a number
    if (!isValidNumber(score)) {
        console.warn(`Invalid score for submission - attempting to convert`);
        score = parseFloat(score);
        if (isNaN(score)) {
            throw new Error("Score must be a valid number");
        }
    }

    // Apply late penalty if submission was late (10% deduction)
    if (isSubmissionLate(submission.submission.submitted_at, assignment.due_at)) {
        const penalty = assignment.points_possible * 0.1;
        score = score - penalty;
        console.log(`Late penalty applied to assignment ${assignment.id}: -${penalty} points`);
    }

    return score;
}

// ========================================
// Main Function
// ========================================

/**
 * Processes learner data and returns formatted results
 * @param {Object} course - Course information
 * @param {Object} ag - Assignment group
 * @param {Array} submissions - Array of learner submissions
 * @returns {Array} Processed learner data
 */
function getLearnerData(course, ag, submissions) {
    try {
        // Validate input data
        validateCourseMatch(course, ag);

        // Validate submissions is an array
        if (!Array.isArray(submissions)) {
            throw new Error("Submissions must be an array");
        }

        // Validate assignments is an array
        if (!Array.isArray(ag.assignments)) {
            throw new Error("Assignment group must contain an assignments array");
        }

        // Object to store learner data (keyed by learner_id)
        const learnerDataMap = {};

        // Process each submission using a traditional for loop
        // (requirement: at least 2 different loop types)
        for (let i = 0; i < submissions.length; i++) {
            const submission = submissions[i];

            try {
                // Validate submission structure
                if (!submission || !submission.submission) {
                    console.warn(`Invalid submission structure at index ${i} - skipping`);
                    continue; // Loop control keyword (requirement)
                }

                // Find the corresponding assignment
                const assignment = findAssignmentById(ag.assignments, submission.assignment_id);

                // If assignment not found, skip this submission
                if (!assignment) {
                    console.warn(`Assignment ${submission.assignment_id} not found - skipping`);
                    continue; // Loop control keyword (requirement)
                }

                // Check if assignment is due
                if (!isAssignmentDue(assignment.due_at)) {
                    console.log(`Assignment ${assignment.id} not yet due - skipping`);
                    continue; // Loop control keyword (requirement)
                }

                // Validate assignment data
                if (!validateAssignment(assignment)) {
                    continue; // Loop control keyword (requirement)
                }

                // Calculate score with potential late penalty
                const finalScore = calculateScore(submission, assignment);

                // Initialize learner data if this is first submission for this learner
                if (!learnerDataMap[submission.learner_id]) {
                    learnerDataMap[submission.learner_id] = {
                        id: submission.learner_id,
                        totalScore: 0,
                        totalPossible: 0,
                        assignments: {}
                    };
                }

                // Get reference to learner data
                const learnerData = learnerDataMap[submission.learner_id];

                // Calculate percentage for this assignment
                const percentage = finalScore / assignment.points_possible;

                // Add assignment score to learner's record
                learnerData.assignments[assignment.id] = percentage;

                // Update totals for weighted average calculation
                learnerData.totalScore += finalScore;
                learnerData.totalPossible += assignment.points_possible;

            } catch (error) {
                console.error(`Error processing submission at index ${i}: ${error.message}`);
                // Continue processing other submissions
                continue;
            }
        }

        // Convert learner data map to array and calculate averages
        const result = [];

        // Use for...in loop to iterate over object properties
        // (requirement: different loop type)
        for (const learnerId in learnerDataMap) {
            const learnerData = learnerDataMap[learnerId];

            // Calculate weighted average
            let avg = 0;
            if (learnerData.totalPossible > 0) {
                avg = learnerData.totalScore / learnerData.totalPossible;
            }

            // Create result object with id, avg, and assignment scores
            const learnerResult = {
                id: learnerData.id,
                avg: avg,
                ...learnerData.assignments // Spread operator to add assignment scores
            };

            result.push(learnerResult);
        }

        // Sort results by learner ID for consistent output
        result.sort((a, b) => a.id - b.id);

        return result;

    } catch (error) {
        console.error(`Fatal error in getLearnerData: ${error.message}`);
        throw error; // Re-throw fatal errors
    }
}

// ========================================
// Test Execution
// ========================================

try {
    console.log("Processing learner data...\n");

    const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);

    console.log("Results:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n--- Expected Output ---");
    console.log("Learner 125: avg ~0.985, assignment 1: 0.94, assignment 2: 1.0");
    console.log("Learner 132: avg ~0.82, assignment 1: 0.78, assignment 2: 0.833");

} catch (error) {
    console.error("Program terminated with error:", error.message);
}

// ========================================
// Additional Test Cases
// ========================================

console.log("\n\n=== Testing Edge Cases ===\n");

// Test 1: Mismatched course ID (should throw error)
console.log("Test 1: Mismatched course ID");
try {
    const badAssignmentGroup = { ...AssignmentGroup, course_id: 999 };
    getLearnerData(CourseInfo, badAssignmentGroup, LearnerSubmissions);
    console.log("❌ Should have thrown an error");
} catch (error) {
    console.log("✓ Correctly caught error:", error.message);
}

// Test 2: Zero points possible
console.log("\nTest 2: Zero points possible");
const zeroPointsAG = {
    ...AssignmentGroup,
    assignments: [
        {
            id: 99,
            name: "Zero Points Assignment",
            due_at: "2023-01-01",
            points_possible: 0
        }
    ]
};
const zeroPointsSubmissions = [
    {
        learner_id: 999,
        assignment_id: 99,
        submission: { submitted_at: "2023-01-01", score: 10 }
    }
];
try {
    const result = getLearnerData(CourseInfo, zeroPointsAG, zeroPointsSubmissions);
    console.log("✓ Handled zero points gracefully:", result);
} catch (error) {
    console.log("✓ Error handled:", error.message);
}

// Test 3: Invalid data types
console.log("\nTest 3: Invalid data types");
const invalidSubmissions = [
    {
        learner_id: 888,
        assignment_id: 1,
        submission: { submitted_at: "2023-01-01", score: "not a number" }
    }
];
try {
    const result = getLearnerData(CourseInfo, AssignmentGroup, invalidSubmissions);
    console.log("Result with invalid data:", result);
} catch (error) {
    console.log("✓ Error caught:", error.message);
}

console.log("\n=== All Tests Complete ===");