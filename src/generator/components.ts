import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { OpenAPIV3 } from 'openapi-types';
import { OpenApiRouter } from '../types';
import { errorResponseObject, zodSchemaToOpenApiSchemaObject } from './schema';

export function getOpenApiComponentsObject(
  appRouter: OpenApiRouter,
  securitySchemeKeys: string[],
): OpenAPIV3.ComponentsObject {
  const schemas: Record<string, OpenAPIV3.SchemaObject> = {};
  const responses: Record<string, OpenAPIV3.ResponseObject> = {};

  // Recursive function to collect schemas from the router
  function collectSchemas(prefix: string, router: OpenApiRouter) {
    const routerDef = router._def;

    if (routerDef && routerDef.procedures) {
      for (const [key, procedureOrRouter] of Object.entries(routerDef.procedures)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;

        if ((procedureOrRouter as any)._def) {
          if ((procedureOrRouter as any)._def.procedures) {
            // It's a nested router
            collectSchemas(fullPath, procedureOrRouter as OpenApiRouter);
          } else {
            // It's a procedure
            const inputParser = (procedureOrRouter as any)._def.inputs[0];
            const outputParser = (procedureOrRouter as any)._def.output;

            // Extract input schema
            if (inputParser && inputParser instanceof z.ZodType) {
              const inputParserName = inputParser;
              // console.log(inputParserName);
              const inputSchemaName = `${fullPath}.${inputParserName?.toString()}`;
              const inputSchema = zodSchemaToOpenApiSchemaObject(inputParser);
              schemas[inputSchemaName] = inputSchema as OpenAPIV3.SchemaObject;
            }

            // Extract output schema
            if (outputParser && outputParser instanceof z.ZodType) {
              const outputSchemaName = `${fullPath}.Output`;
              const outputSchema = zodSchemaToOpenApiSchemaObject(outputParser);
              schemas[outputSchemaName] = outputSchema as OpenAPIV3.SchemaObject;
            }
          }
        }
      }
    }
  }

  // Start collecting schemas from the root router
  collectSchemas('', appRouter);

  // Define standard ErrorResponse schema and response
  const errorResponseSchemaName = 'ErrorResponse';
  schemas[errorResponseSchemaName] = errorResponseObject;

  responses[errorResponseSchemaName] = {
    description: 'Error response',
    content: {
      'application/json': {
        schema: { $ref: `#/components/schemas/${errorResponseSchemaName}` },
      },
    },
  };

  return {
    schemas,
    responses,
    securitySchemes: securitySchemeKeys.reduce((acc, key) => {
      if (!acc) {
        acc = {};
      }
      acc[key] = {
        type: 'http',
        scheme: 'bearer',
      };
      return acc;
    }, {} as OpenAPIV3.ComponentsObject['securitySchemes']),
  };
}
