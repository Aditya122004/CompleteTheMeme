import http from "k6/http";
import { check, sleep } from "k6";
import exec from "k6/execution";
import { Counter, Rate, Trend } from "k6/metrics";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

const PASSWORD = __ENV.QUIZ_PASSWORD || "infotrek";

const USERS_FILE = __ENV.USERS_FILE || "./users.json";

// How many answers each user should send to check-answer
// We deliberately use multiple requests to simulate guessing.
const CHECK_ATTEMPTS_PER_QUESTION = 2;


// --------------------------------------------------
// CUSTOM METRICS
// --------------------------------------------------

const loginErrors = new Rate("login_errors");
const questionErrors = new Rate("question_errors");
const checkAnswerErrors = new Rate("check_answer_errors");
const submitErrors = new Rate("submit_errors");

const loginDuration = new Trend("login_duration");
const questionsDuration = new Trend("questions_duration");
const checkAnswerDuration = new Trend("check_answer_duration");
const submitDuration = new Trend("submit_duration");

const totalSubmissions = new Counter("total_submissions");


// --------------------------------------------------
// LOAD USERS
// --------------------------------------------------

const users = JSON.parse(open(USERS_FILE));


// --------------------------------------------------
// K6 OPTIONS
// --------------------------------------------------

export const options = {

    scenarios: {

        quiz_load: {

            executor: "ramping-vus",

            startVUs: 0,

            stages: [

                // Warm up
                {
                    duration: "30s",
                    target: 10
                },

                // 10 concurrent users
                {
                    duration: "1m",
                    target: 10
                },

                // Increase to 50
                {
                    duration: "30s",
                    target: 50
                },

                // Hold 50
                {
                    duration: "1m",
                    target: 50
                },

                // Increase to 100
                {
                    duration: "30s",
                    target: 100
                },

                // Hold 100
                {
                    duration: "2m",
                    target: 100
                },

                // Increase to 250
                {
                    duration: "30s",
                    target: 250
                },

                // Hold 250
                {
                    duration: "2m",
                    target: 250
                },

                // Increase to 500
                {
                    duration: "30s",
                    target: 500
                },

                // Hold 500
                {
                    duration: "2m",
                    target: 500
                },

                // Ramp down
                {
                    duration: "1m",
                    target: 0
                }
            ],

            gracefulRampDown: "30s"
        }
    },

    thresholds: {

        // Overall HTTP performance
        http_req_failed: [
            "rate<0.05"
        ],

        http_req_duration: [
            "p(95)<1000",
            "p(99)<2000"
        ],

        // API-specific thresholds
        login_errors: [
            "rate<0.05"
        ],

        question_errors: [
            "rate<0.05"
        ],

        check_answer_errors: [
            "rate<0.05"
        ],

        submit_errors: [
            "rate<0.05"
        ],

        login_duration: [
            "p(95)<1000"
        ],

        questions_duration: [
            "p(95)<1000"
        ],

        check_answer_duration: [
            "p(95)<1000"
        ],

        submit_duration: [
            "p(95)<1500"
        ]
    }
};


// --------------------------------------------------
// DEFAULT TEST
// --------------------------------------------------

export default function () {

    /*
     * Each VU gets a user.
     *
     * IMPORTANT:
     * You need enough seeded users for the number
     * of concurrent participants you want to test.
     */

    const userIndex =
        (__VU - 1) % users.length;

    const user = users[userIndex];

    const rollNo = user.rollNo;


    // --------------------------------------------------
    // STEP 1: LOGIN
    // --------------------------------------------------

    const loginPayload = JSON.stringify({
        rollNo: rollNo,
        password: PASSWORD
    });

    const loginParams = {
        headers: {
            "Content-Type": "application/json"
        },

        tags: {
            endpoint: "login"
        }
    };

    const loginStart = Date.now();

    const loginResponse = http.post(
        `${BASE_URL}/api/auth/login`,
        loginPayload,
        loginParams
    );

    loginDuration.add(
        Date.now() - loginStart
    );

    const loginOK = check(
        loginResponse,
        {
            "login status is 200":
                (r) => r.status === 200,

            "login returns token":
                (r) => {
                    try {
                        return !!r.json("token");
                    } catch {
                        return false;
                    }
                }
        }
    );

    if (!loginOK) {

        loginErrors.add(1);

        console.error(
            `Login failed for ${rollNo}: ${loginResponse.status} ${loginResponse.body}`
        );

        return;
    }

    loginErrors.add(0);

    const token =
        loginResponse.json("token");


    // Small delay to simulate a real user
    sleep(Math.random() * 2 + 1);


    // --------------------------------------------------
    // STEP 2: GET QUESTIONS
    // --------------------------------------------------

    const authHeaders = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        tags: {
            endpoint: "questions"
        }
    };

    const questionsStart = Date.now();

    const questionsResponse = http.get(
        `${BASE_URL}/api/quiz/questions`,
        authHeaders
    );

    questionsDuration.add(
        Date.now() - questionsStart
    );

    const questionsOK = check(
        questionsResponse,
        {
            "questions status is 200":
                (r) => r.status === 200,

            "questions returned":
                (r) => {
                    try {
                        const body = r.json();

                        return Array.isArray(body) &&
                            body.length > 0;
                    } catch {
                        return false;
                    }
                }
        }
    );

    if (!questionsOK) {

        questionErrors.add(1);

        console.error(
            `Question fetch failed for ${rollNo}: ${questionsResponse.status}`
        );

        return;
    }

    questionErrors.add(0);


    let questions;

    try {
        questions = questionsResponse.json();
    } catch (error) {

        console.error(
            `Could not parse questions for ${rollNo}`
        );

        return;
    }


    // --------------------------------------------------
    // STEP 3: CHECK ANSWERS
    // --------------------------------------------------

    const submittedAnswers = [];


    for (const question of questions) {

        /*
         * IMPORTANT:
         *
         * The API should NOT return question.answer.
         *
         * Therefore we deliberately send incorrect
         * answers during stress testing.
         *
         * This stresses the check-answer endpoint
         * without requiring the actual answers.
         */

        const testAnswer = "wronganswer";


        // Save answer for final submission
        submittedAnswers.push({
            questionId: question._id,
            answer: testAnswer
        });


        // Only input questions need repeated guessing.
        //
        // If your API accepts check-answer for MCQs too,
        // this will still work.
        const attempts =
            question.type === "input"
                ? CHECK_ATTEMPTS_PER_QUESTION
                : 1;


        for (
            let attempt = 0;
            attempt < attempts;
            attempt++
        ) {

            const checkPayload = JSON.stringify({
                questionId: question._id,
                answer: testAnswer
            });

            const checkParams = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                tags: {
                    endpoint: "check-answer"
                }
            };

            const checkStart = Date.now();

            const checkResponse = http.post(
                `${BASE_URL}/api/quiz/check-answer`,
                checkPayload,
                checkParams
            );

            checkAnswerDuration.add(
                Date.now() - checkStart
            );


            /*
             * A wrong answer should still produce a
             * successful HTTP response.
             *
             * We expect 200, not 4xx.
             */

            const checkOK = check(
                checkResponse,
                {
                    "check-answer status is 200":
                        (r) => r.status === 200
                }
            );

            if (!checkOK) {

                checkAnswerErrors.add(1);

                console.error(
                    `check-answer failed for ${rollNo}: ${checkResponse.status}`
                );

            } else {

                checkAnswerErrors.add(0);
            }


            // Simulate time between guesses
            sleep(
                Math.random() * 0.5 + 0.2
            );
        }
    }


    // --------------------------------------------------
    // STEP 4: SUBMIT QUIZ
    // --------------------------------------------------

    /*
 * Submit the quiz.
 *
 * Multiple attempts are allowed by the backend.
 * Each VU uses a user from users.json.
 */
    const submitPayload = JSON.stringify({
        answers: submittedAnswers
    });

    const submitParams = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        tags: {
            endpoint: "submit"
        }
    };

    const submitStart = Date.now();

    const submitResponse = http.post(
        `${BASE_URL}/api/quiz/submit`,
        submitPayload,
        submitParams
    );

    submitDuration.add(
        Date.now() - submitStart
    );


   const submitOK = check(
    submitResponse,
    {
        "submit status is 201":
            (r) => r.status === 201
    }
);

    if (!submitOK) {

        submitErrors.add(1);

        console.error(
            `Submit failed for ${rollNo}: ${submitResponse.status} ${submitResponse.body}`
        );

    } else {

        submitErrors.add(0);

        totalSubmissions.add(1);
    }


    // User finishes quiz
    sleep(2);
}