import { SwaggerOptions } from "swagger-ui-express";

export const swaggerOptions: SwaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth API Documentation',
            version: '1.0.0',
            description: 'This is the API documentation.',
        },
        servers: [
            {
                url: 'http://localhost:8000/',
                description: 'Development server',
            },
        ],
    },
    apis: ['./controllers/auth/*.ts'],
};
