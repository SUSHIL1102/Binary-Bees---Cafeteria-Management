import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cafeteria Seat Reservation API",
      version: "1.0.0",
      description:
        "API for employees to reserve cafeteria seats. Single location, 100 seats, one reservation per employee per day. Authenticate via w3 SSO (mock supported for local dev).",
    },
    servers: [{ url: "http://localhost:3001", description: "Development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options) as ReturnType<typeof swaggerJsdoc>;
