/**
 * Hand-written to match src/app/api/v1 exactly, not generated from
 * annotations — there are 23 endpoints and every shape here was copied from
 * the actual zod schema / response object in the route that serves it, not
 * inferred. Keep it in sync by hand when a route's contract changes.
 */

import { APP_NAME } from "@/lib/config"

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
}

const bearerAuth = [{ bearerAuth: [] as string[] }]

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: `${APP_NAME} API`,
    version: "1.0.0",
    description:
      `REST API for the ${APP_NAME} mobile apps (students and teachers). Every endpoint under /api/v1 ` +
      "is public to the internet (not protected by the web app's cookie session or its login proxy) " +
      "and authenticates purely via the `Authorization: Bearer <accessToken>` header — see **Authentication** below.\n\n" +
      "## Authentication\n" +
      "1. `POST /auth/login` to get an `accessToken` (15 minutes) and a `refreshToken` (30 days).\n" +
      "2. Send `Authorization: Bearer <accessToken>` on every other request.\n" +
      "3. When a request fails with 401, call `POST /auth/refresh` with the `refreshToken` to get a new pair — " +
      "refresh tokens rotate on every use, so store the new one and discard the old.\n" +
      "4. `POST /auth/logout` with the `refreshToken` to end that one session. A password change " +
      "(outside this API) ends every session for the account at once.\n\n" +
      "## Errors\n" +
      "Every error is `{ \"error\": { \"message\": string } }` with a matching HTTP status " +
      "(400/401/403/404/409/422/429/500). Validation errors (422) use the first failing field's message.",
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    { name: "Auth", description: "Registration, email verification, login, token refresh, logout." },
    { name: "Profile", description: "The signed-in user's own account." },
    { name: "Student / Exams", description: "Browsing and taking exams." },
    { name: "Student / Attempts", description: "An in-progress or finished exam attempt." },
    { name: "Teacher / Exams", description: "Creating and managing exams." },
    { name: "Teacher / Questions", description: "Managing the reusable question bank." },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "The accessToken returned by /auth/login or /auth/refresh.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: { message: { type: "string" } },
            required: ["message"],
          },
        },
        required: ["error"],
      },
      Role: { type: "string", enum: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"] },
      TeacherVerificationStatus: { type: "string", enum: ["PENDING", "VERIFIED", "REJECTED"] },
      OptionChoice: { type: "string", enum: ["A", "B", "C", "D"] },
      Difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] },
      QuestionStatus: { type: "string", enum: ["DRAFT", "ACTIVE", "ARCHIVED"] },
      ExamStatus: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
      AttemptStatus: {
        type: "string",
        enum: ["IN_PROGRESS", "COMPLETED", "TIMEOUT", "DISQUALIFIED"],
      },

      TokenPair: {
        type: "object",
        properties: {
          accessToken: { type: "string", description: "JWT, expires in `expiresIn` seconds." },
          refreshToken: {
            type: "string",
            description: "Opaque, single-use — exchange it via /auth/refresh before or once it's rejected.",
          },
          tokenType: { type: "string", enum: ["Bearer"] },
          expiresIn: { type: "integer", example: 900 },
        },
        required: ["accessToken", "refreshToken", "tokenType", "expiresIn"],
      },
      UserSummary: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { $ref: "#/components/schemas/Role" },
        },
      },
      Me: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { $ref: "#/components/schemas/Role" },
          teacherVerificationStatus: { $ref: "#/components/schemas/TeacherVerificationStatus" },
        },
      },

      ExamSummary: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          durationMinutes: { type: "integer" },
          maxAttempts: { type: "integer" },
          startTime: { type: "string", format: "date-time", nullable: true },
          endTime: { type: "string", format: "date-time", nullable: true },
          leaderboardEnabled: { type: "boolean" },
          _count: {
            type: "object",
            properties: { examQuestions: { type: "integer" } },
          },
        },
      },
      ExamInput: {
        type: "object",
        description: "Shared by create and update (PUT-style full replace).",
        properties: {
          title: { type: "string", minLength: 3, maxLength: 200 },
          description: { type: "string", maxLength: 2000, nullable: true },
          durationMinutes: { type: "integer", minimum: 1, maximum: 600 },
          maxAttempts: { type: "integer", minimum: 1, maximum: 10 },
          passingMarks: { type: "number", minimum: 0, nullable: true },
          startTime: { type: "string", format: "date-time", nullable: true },
          endTime: { type: "string", format: "date-time", nullable: true },
          shuffleQuestions: { type: "boolean" },
          shuffleOptions: { type: "boolean" },
          webcamMonitoringRequired: { type: "boolean" },
          violationReviewThreshold: { type: "integer", minimum: 1, maximum: 1000 },
        },
        required: [
          "title",
          "durationMinutes",
          "maxAttempts",
          "shuffleQuestions",
          "shuffleOptions",
          "webcamMonitoringRequired",
          "violationReviewThreshold",
        ],
      },
      ExamDetail: {
        allOf: [
          { $ref: "#/components/schemas/ExamSummary" },
          {
            type: "object",
            properties: {
              status: { $ref: "#/components/schemas/ExamStatus" },
              teacherId: { type: "string", format: "uuid" },
              examQuestions: {
                type: "array",
                items: { type: "object", description: "ExamQuestion row, order-sorted." },
              },
            },
          },
        ],
      },

      QuestionInput: {
        type: "object",
        properties: {
          subject: { type: "string", minLength: 1, maxLength: 100 },
          topic: { type: "string", minLength: 1, maxLength: 100 },
          difficulty: { $ref: "#/components/schemas/Difficulty" },
          questionText: { type: "string", minLength: 3, maxLength: 5000 },
          optionA: { type: "string", minLength: 1, maxLength: 1000 },
          optionB: { type: "string", minLength: 1, maxLength: 1000 },
          optionC: { type: "string", minLength: 1, maxLength: 1000 },
          optionD: { type: "string", minLength: 1, maxLength: 1000 },
          correctOption: { $ref: "#/components/schemas/OptionChoice" },
          explanation: { type: "string", maxLength: 5000, nullable: true },
          imageUrl: { type: "string", format: "uri", nullable: true },
          codeSnippet: { type: "string", maxLength: 5000, nullable: true },
          codeLanguage: { type: "string", maxLength: 50, nullable: true },
          confirmDuplicate: {
            type: "boolean",
            description: "Resubmit despite a detected duplicate (409) of an existing question.",
          },
        },
        required: [
          "subject",
          "topic",
          "difficulty",
          "questionText",
          "optionA",
          "optionB",
          "optionC",
          "optionD",
          "correctOption",
        ],
      },
      Question: {
        allOf: [
          { $ref: "#/components/schemas/QuestionInput" },
          {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              teacherId: { type: "string", format: "uuid" },
              status: { $ref: "#/components/schemas/QuestionStatus" },
              contentHash: { type: "string" },
            },
          },
        ],
      },
      Page: {
        type: "object",
        properties: {
          items: { type: "array", items: {} },
          total: { type: "integer" },
          page: { type: "integer" },
          pageCount: { type: "integer" },
        },
      },

      AttemptAnswerForStudent: {
        type: "object",
        description: "Never includes the correct option or explanation while the attempt is live.",
        properties: {
          id: { type: "string", format: "uuid" },
          examQuestionId: { type: "string", format: "uuid" },
          selectedOption: { allOf: [{ $ref: "#/components/schemas/OptionChoice" }], nullable: true },
          isMarkedForReview: { type: "boolean" },
          marks: { type: "number" },
          questionText: { type: "string" },
          optionOrder: {
            type: "array",
            items: { $ref: "#/components/schemas/OptionChoice" },
            description: "Display order — shuffled per-attempt when the exam has shuffleOptions on.",
          },
          optionText: {
            type: "object",
            additionalProperties: { type: "string" },
            description: "Keyed A-D regardless of display order.",
          },
        },
      },
      AttemptForStudent: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          status: { $ref: "#/components/schemas/AttemptStatus" },
          startedAt: { type: "string", format: "date-time" },
          deadline: { type: "string", format: "date-time" },
          exam: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              title: { type: "string" },
              durationMinutes: { type: "integer" },
              shuffleOptions: { type: "boolean" },
            },
          },
          answers: {
            type: "array",
            items: { $ref: "#/components/schemas/AttemptAnswerForStudent" },
          },
        },
      },
      ResultForStudent: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          studentId: { type: "string", format: "uuid" },
          examId: { type: "string", format: "uuid" },
          examTitle: { type: "string" },
          status: { $ref: "#/components/schemas/AttemptStatus" },
          result: {
            type: "object",
            nullable: true,
            description: "null until the teacher publishes the result (ExamResult.status = PUBLISHED).",
          },
          answerKeyReleased: { type: "boolean" },
          questions: {
            type: "array",
            nullable: true,
            description: "null until the exam's answer key is released.",
            items: { type: "object" },
          },
        },
      },
      LeaderboardEntry: {
        type: "object",
        properties: {
          rank: { type: "integer" },
          studentId: { type: "string", format: "uuid" },
          studentName: { type: "string" },
          obtainedMarks: { type: "number" },
          totalMarks: { type: "number" },
          accuracy: { type: "number" },
          timeTakenSec: { type: "integer", nullable: true },
          submittedAt: { type: "string", format: "date-time" },
          percentile: { type: "number" },
        },
      },
      LeaderboardPage: {
        type: "object",
        properties: {
          entries: { type: "array", items: { $ref: "#/components/schemas/LeaderboardEntry" } },
          totalParticipants: { type: "integer" },
          page: { type: "integer" },
          pageCount: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account (always STUDENT)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
                required: ["name", "email", "password"],
              },
            },
          },
        },
        responses: {
          "201": {
            description:
              "Same response whether or not the email was already registered — never reveals which.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { requiresEmailVerification: { type: "boolean" } },
                },
              },
            },
          },
          "422": errorResponse,
          "429": errorResponse,
        },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Confirm the 6-digit OTP emailed on registration",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  otp: { type: "string", pattern: "^\\d{6}$" },
                },
                required: ["email", "otp"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Verified",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
          "401": errorResponse,
          "422": errorResponse,
          "429": errorResponse,
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Exchange credentials for a token pair",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed in",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/TokenPair" },
                    {
                      type: "object",
                      properties: { user: { $ref: "#/components/schemas/UserSummary" } },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            ...errorResponse,
            description: "Invalid credentials, unverified email, suspended, or deactivated account — one generic message for all of them.",
          },
          "422": errorResponse,
          "429": errorResponse,
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate a refresh token for a new token pair",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refreshToken: { type: "string" } },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "New pair — the old refreshToken is now revoked",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TokenPair" } },
            },
          },
          "401": { ...errorResponse, description: "Unknown, expired, already-used, or revoked token." },
          "422": errorResponse,
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke one refresh token (this device only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refreshToken: { type: "string" } },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Always succeeds, even for an already-revoked/unknown token",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
          "422": errorResponse,
        },
      },
    },

    "/me": {
      get: {
        tags: ["Profile"],
        summary: "The signed-in user",
        security: bearerAuth,
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Me" } } },
          },
          "401": errorResponse,
        },
      },
    },

    "/exams": {
      get: {
        tags: ["Student / Exams"],
        summary: "List exams currently open to the signed-in student",
        security: bearerAuth,
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    exams: { type: "array", items: { $ref: "#/components/schemas/ExamSummary" } },
                  },
                },
              },
            },
          },
          "401": errorResponse,
          "403": { ...errorResponse, description: "Not a STUDENT." },
        },
      },
    },
    "/exams/{examId}": {
      get: {
        tags: ["Student / Exams"],
        summary: "Exam detail (published exams only — anything else is 404)",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { exam: { $ref: "#/components/schemas/ExamSummary" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
    },
    "/exams/{examId}/attempts": {
      post: {
        tags: ["Student / Exams"],
        summary: "Start a new attempt, or resume the in-progress one",
        description:
          "Idempotent: calling this while an IN_PROGRESS attempt already exists resumes it (200) " +
          "instead of starting a duplicate (201).",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  webcamConsent: {
                    type: "boolean",
                    description: "Required (true) if the exam has webcamMonitoringRequired set.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Resumed an existing in-progress attempt",
            content: {
              "application/json": {
                schema: { type: "object", properties: { attemptId: { type: "string", format: "uuid" } } },
              },
            },
          },
          "201": {
            description: "Started a new attempt",
            content: {
              "application/json": {
                schema: { type: "object", properties: { attemptId: { type: "string", format: "uuid" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": {
            ...errorResponse,
            description:
              "Exam not published / outside its open window / no questions / attempts exhausted.",
          },
          "422": { ...errorResponse, description: "Webcam consent required but not given." },
        },
      },
    },
    "/exams/{examId}/leaderboard": {
      get: {
        tags: ["Student / Exams"],
        summary: "Exam leaderboard",
        security: bearerAuth,
        parameters: [
          { name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LeaderboardPage" } },
            },
          },
          "401": errorResponse,
          "404": errorResponse,
          "409": { ...errorResponse, description: "Leaderboard disabled for this exam." },
        },
      },
    },

    "/attempts/{attemptId}": {
      get: {
        tags: ["Student / Attempts"],
        summary: "Fetch an attempt (to resume taking it)",
        description: "Never includes which option is correct, regardless of attempt status.",
        security: bearerAuth,
        parameters: [{ name: "attemptId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { attempt: { $ref: "#/components/schemas/AttemptForStudent" } },
                },
              },
            },
          },
          "401": errorResponse,
          "403": { ...errorResponse, description: "Not your attempt, or not a STUDENT." },
          "404": errorResponse,
        },
      },
    },
    "/attempts/{attemptId}/answers": {
      patch: {
        tags: ["Student / Attempts"],
        summary: "Autosave one question's answer",
        description:
          "Conditional on clientUpdatedAt being strictly newer than what's stored — an out-of-order " +
          "retry silently no-ops (`applied: false`) instead of clobbering a newer edit.",
        security: bearerAuth,
        parameters: [{ name: "attemptId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  examQuestionId: { type: "string", format: "uuid" },
                  selectedOption: {
                    allOf: [{ $ref: "#/components/schemas/OptionChoice" }],
                    nullable: true,
                  },
                  isMarkedForReview: { type: "boolean" },
                  clientUpdatedAt: { type: "string", format: "date-time" },
                  sessionToken: {
                    type: "string",
                    maxLength: 200,
                    description: "Opaque per-app-launch token, used server-side for session-conflict detection.",
                  },
                },
                required: ["examQuestionId", "clientUpdatedAt", "sessionToken"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, applied: { type: "boolean" } },
                },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": { ...errorResponse, description: "This attempt has already ended." },
          "422": { ...errorResponse, description: "examQuestionId isn't part of this attempt." },
        },
      },
    },
    "/attempts/{attemptId}/submit": {
      post: {
        tags: ["Student / Attempts"],
        summary: "Submit (finish) an attempt",
        description:
          "Idempotent — resubmitting an already-finalized attempt returns its settled status " +
          "with `alreadySubmitted: true` instead of erroring.",
        security: bearerAuth,
        parameters: [{ name: "attemptId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  clientTimezone: {
                    type: "string",
                    description: "IANA zone, e.g. Asia/Dhaka — used only for the daily-streak side effect.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    status: { $ref: "#/components/schemas/AttemptStatus" },
                    alreadySubmitted: { type: "boolean" },
                  },
                },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
    },
    "/attempts/{attemptId}/result": {
      get: {
        tags: ["Student / Attempts"],
        summary: "Fetch the result of a finished attempt",
        description: "result and questions stay null until the teacher publishes/releases them.",
        security: bearerAuth,
        parameters: [{ name: "attemptId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { result: { $ref: "#/components/schemas/ResultForStudent" } },
                },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
    },

    "/teacher/exams": {
      get: {
        tags: ["Teacher / Exams"],
        summary: "List the signed-in teacher's own exams",
        security: bearerAuth,
        parameters: [
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/ExamStatus" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Page" },
                    {
                      type: "object",
                      properties: {
                        items: { type: "array", items: { $ref: "#/components/schemas/ExamDetail" } },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
        },
      },
      post: {
        tags: ["Teacher / Exams"],
        summary: "Create a draft exam",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ExamInput" } } },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { type: "object", properties: { exam: { $ref: "#/components/schemas/ExamDetail" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "422": errorResponse,
        },
      },
    },
    "/teacher/exams/{examId}": {
      get: {
        tags: ["Teacher / Exams"],
        summary: "Exam detail, with its questions",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { exam: { $ref: "#/components/schemas/ExamDetail" } } },
              },
            },
          },
          "401": errorResponse,
          "403": { ...errorResponse, description: "Not this exam's owner." },
          "404": errorResponse,
        },
      },
      patch: {
        tags: ["Teacher / Exams"],
        summary: "Replace a DRAFT exam's fields",
        description: "A published or archived exam can no longer be edited (409).",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ExamInput" } } },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { exam: { $ref: "#/components/schemas/ExamDetail" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": errorResponse,
          "422": errorResponse,
        },
      },
      delete: {
        tags: ["Teacher / Exams"],
        summary: "Delete a DRAFT exam",
        description: "A published/archived exam can never be deleted — archive it instead (409).",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": errorResponse,
        },
      },
    },
    "/teacher/exams/{examId}/publish": {
      post: {
        tags: ["Teacher / Exams"],
        summary: "Publish a draft exam",
        description:
          "One-way (DRAFT -> PUBLISHED only). Requires at least one question, and — unless the " +
          "requireTeacherVerification platform setting is off — a VERIFIED teacher account.",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { exam: { $ref: "#/components/schemas/ExamDetail" } } },
              },
            },
          },
          "401": errorResponse,
          "403": { ...errorResponse, description: "Not the owner, or teacher not verified." },
          "404": errorResponse,
          "409": { ...errorResponse, description: "Not a DRAFT exam." },
          "422": { ...errorResponse, description: "No questions yet." },
        },
      },
    },
    "/teacher/exams/{examId}/archive": {
      post: {
        tags: ["Teacher / Exams"],
        summary: "Archive an exam",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { exam: { $ref: "#/components/schemas/ExamDetail" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": { ...errorResponse, description: "Already archived." },
        },
      },
    },
    "/teacher/exams/{examId}/results": {
      get: {
        tags: ["Teacher / Exams"],
        summary: "This exam's full attempt roster",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { attempts: { type: "array", items: {} } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
    },
    "/teacher/exams/{examId}/questions": {
      post: {
        tags: ["Teacher / Exams"],
        summary: "Attach bank questions to this (draft) exam",
        description:
          "Snapshots each question's content onto the exam immediately — editing or deleting the " +
          "bank question afterward never changes the exam. Only ACTIVE questions owned by this " +
          "teacher can be added; already-locked (non-DRAFT) exams reject this with 409.",
        security: bearerAuth,
        parameters: [{ name: "examId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  questionIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                    minItems: 1,
                    maxItems: 100,
                  },
                },
                required: ["questionIds"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" }, added: { type: "integer" } },
                },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": { ...errorResponse, description: "Exam's question list is locked (not DRAFT)." },
          "422": {
            ...errorResponse,
            description: "None of the given questions are available (wrong owner, not ACTIVE, or already added).",
          },
        },
      },
    },

    "/teacher/questions": {
      get: {
        tags: ["Teacher / Questions"],
        summary: "List the signed-in teacher's question bank",
        security: bearerAuth,
        parameters: [{ name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Page" },
                    {
                      type: "object",
                      properties: {
                        items: { type: "array", items: { $ref: "#/components/schemas/Question" } },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
        },
      },
      post: {
        tags: ["Teacher / Questions"],
        summary: "Create a question (starts as DRAFT)",
        description:
          "A question must be moved to ACTIVE (see the /status endpoint) before it can be attached " +
          "to an exam. A content-hash duplicate of an existing question returns 409 unless " +
          "`confirmDuplicate: true` is sent.",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/QuestionInput" } } },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { type: "object", properties: { question: { $ref: "#/components/schemas/Question" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "409": { ...errorResponse, description: "Duplicate detected." },
          "422": errorResponse,
        },
      },
    },
    "/teacher/questions/{questionId}": {
      get: {
        tags: ["Teacher / Questions"],
        summary: "Question detail (with reports and exam-usage count)",
        security: bearerAuth,
        parameters: [{ name: "questionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { question: { $ref: "#/components/schemas/Question" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
      patch: {
        tags: ["Teacher / Questions"],
        summary: "Replace a question's fields",
        security: bearerAuth,
        parameters: [{ name: "questionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/QuestionInput" } } },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { question: { $ref: "#/components/schemas/Question" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": { ...errorResponse, description: "Duplicate detected." },
          "422": errorResponse,
        },
      },
      delete: {
        tags: ["Teacher / Questions"],
        summary: "Delete a question",
        description: "Refuses (409) if the question is used in any exam — archive it instead.",
        security: bearerAuth,
        parameters: [{ name: "questionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "409": errorResponse,
        },
      },
    },
    "/teacher/questions/{questionId}/status": {
      post: {
        tags: ["Teacher / Questions"],
        summary: "Transition a question's status",
        description: "Allowed moves: DRAFT -> ACTIVE, ACTIVE -> ARCHIVED, ARCHIVED -> ACTIVE.",
        security: bearerAuth,
        parameters: [{ name: "questionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { status: { $ref: "#/components/schemas/QuestionStatus" } },
                required: ["status"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { question: { $ref: "#/components/schemas/Question" } } },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
          "422": { ...errorResponse, description: "Not an allowed transition from the current status." },
        },
      },
    },
  },
} as const
