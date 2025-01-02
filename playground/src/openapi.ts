import { port } from '.';
import { generateOpenApiDocument } from '../../src';
import { appRouter } from './router';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Example CRUD API',
  description: 'OpenAPI compliant REST API built using tRPC with Express',
  version: '1.0.0',
  baseUrl: `http://localhost:${port}/api`,
  docsUrl: 'https://github.com/jlalmes/trpc-openapi',
  tags: ['auth', 'users', 'posts'],
});
