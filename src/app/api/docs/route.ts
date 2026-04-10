import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "A/B Testing API",
    description:
      "Simple A/B testing tool API. Create experiments, configure variants, and assign users automatically based on traffic allocation ratios.",
    version: "1.0.0",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    {
      name: "Experiments",
      description: "Manage A/B test experiments",
    },
    {
      name: "Assignment",
      description: "Assign users to experiment variants",
    },
  ],
  paths: {
    "/api/experiments": {
      get: {
        tags: ["Experiments"],
        summary: "List all experiments",
        description: "Returns all experiments with assignment counts, ordered by creation date (newest first).",
        responses: {
          "200": {
            description: "List of experiments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ExperimentWithCount" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Experiments"],
        summary: "Create a new experiment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateExperimentRequest" },
              example: {
                name: "Homepage CTA Test",
                key: "homepage-cta-test",
                description: "Testing blue vs red CTA button on homepage",
                ratioA: 50,
                variantALabel: "Blue Button",
                variantAValue: '{"color": "blue"}',
                variantBLabel: "Red Button",
                variantBValue: '{"color": "red"}',
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Experiment created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Experiment" },
              },
            },
          },
          "400": {
            description: "Validation error (name and key are required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Experiment key already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/experiments/{id}": {
      get: {
        tags: ["Experiments"],
        summary: "Get experiment details",
        description: "Returns a single experiment with all its assignments.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Experiment ID",
          },
        ],
        responses: {
          "200": {
            description: "Experiment details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ExperimentDetail" },
              },
            },
          },
          "404": {
            description: "Experiment not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Experiments"],
        summary: "Update experiment settings",
        description: "Update ratio, variant labels/values, active status, or other fields. Only include fields you want to change.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Experiment ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateExperimentRequest" },
              example: {
                ratioA: 70,
                variantALabel: "Blue Button",
                active: true,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Experiment updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Experiment" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Experiments"],
        summary: "Delete an experiment",
        description: "Permanently deletes an experiment and all its assignments.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Experiment ID",
          },
        ],
        responses: {
          "200": {
            description: "Experiment deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/experiments/{id}/assign": {
      post: {
        tags: ["Assignment"],
        summary: "Assign user by experiment ID",
        description:
          "Assigns a user to variant A or B based on the configured ratio. If the user is already assigned, returns the existing assignment.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Experiment ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: {
                    type: "string",
                    description: "Unique user identifier",
                    example: "user-12345",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Existing assignment returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Assignment" },
              },
            },
          },
          "201": {
            description: "New assignment created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Assignment" },
              },
            },
          },
          "400": {
            description: "userId is required or experiment is not active",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Experiment not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/assign": {
      get: {
        tags: ["Assignment"],
        summary: "Assign user by experiment key (Public API)",
        description:
          "**Primary integration endpoint.** Assigns a user to a variant using the experiment key. Returns the variant assignment along with the configured label and value. If the user is already assigned, returns the existing assignment. Same user always gets the same variant.",
        parameters: [
          {
            name: "key",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Experiment key",
            example: "homepage-cta-test",
          },
          {
            name: "userId",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Unique user identifier",
            example: "user-12345",
          },
        ],
        responses: {
          "200": {
            description: "Assignment result with variant config",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicAssignmentResponse" },
                example: {
                  variant: "A",
                  label: "Blue Button",
                  value: { color: "blue" },
                },
              },
            },
          },
          "400": {
            description: "Missing parameters or experiment is not active",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Experiment not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Experiment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          key: { type: "string", description: "Unique experiment key for API integration" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          ratioA: { type: "integer", minimum: 0, maximum: 100, description: "Variant A traffic percentage" },
          variantALabel: { type: "string" },
          variantAValue: { type: "string", description: "JSON string for variant A config" },
          variantBLabel: { type: "string" },
          variantBValue: { type: "string", description: "JSON string for variant B config" },
          active: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ExperimentWithCount: {
        allOf: [
          { $ref: "#/components/schemas/Experiment" },
          {
            type: "object",
            properties: {
              _count: {
                type: "object",
                properties: {
                  assignments: { type: "integer" },
                },
              },
            },
          },
        ],
      },
      ExperimentDetail: {
        allOf: [
          { $ref: "#/components/schemas/Experiment" },
          {
            type: "object",
            properties: {
              assignments: {
                type: "array",
                items: { $ref: "#/components/schemas/Assignment" },
              },
              _count: {
                type: "object",
                properties: {
                  assignments: { type: "integer" },
                },
              },
            },
          },
        ],
      },
      Assignment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          experimentId: { type: "string", format: "uuid" },
          userId: { type: "string" },
          variant: { type: "string", enum: ["A", "B"] },
          assignedAt: { type: "string", format: "date-time" },
        },
      },
      PublicAssignmentResponse: {
        type: "object",
        properties: {
          variant: { type: "string", enum: ["A", "B"] },
          label: { type: "string", description: "Variant label" },
          value: { type: "object", description: "Variant config (parsed JSON)" },
        },
      },
      CreateExperimentRequest: {
        type: "object",
        required: ["name", "key"],
        properties: {
          name: { type: "string" },
          key: { type: "string", description: "URL-safe unique key" },
          description: { type: "string" },
          ratioA: { type: "integer", minimum: 0, maximum: 100, default: 50 },
          variantALabel: { type: "string", default: "A" },
          variantAValue: { type: "string", default: "{}" },
          variantBLabel: { type: "string", default: "B" },
          variantBValue: { type: "string", default: "{}" },
        },
      },
      UpdateExperimentRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          ratioA: { type: "integer", minimum: 0, maximum: 100 },
          variantALabel: { type: "string" },
          variantAValue: { type: "string" },
          variantBLabel: { type: "string" },
          variantBValue: { type: "string" },
          active: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
