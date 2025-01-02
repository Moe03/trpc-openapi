/* eslint-disable @typescript-eslint/no-misused-promises */
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './openapi';
import { appRouter, createContext } from './router';
import { createOpenApiExpressMiddleware } from '../../src';

const app = express();
export const port = 3001;

// Setup CORS
app.use(cors());

// Handle incoming tRPC requests
app.use('/api/trpc', createExpressMiddleware({ router: appRouter, createContext }));
// Handle incoming OpenAPI requests
app.use('/api', createOpenApiExpressMiddleware({ router: appRouter, createContext }));

// Serve Swagger UI with our OpenAPI schema
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(openApiDocument));

app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
