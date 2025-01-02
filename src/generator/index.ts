import { OpenAPIV3 } from 'openapi-types';

import { OpenApiRouter } from '../types';
import { getOpenApiPathsObject } from './paths';
import { errorResponseObject } from './schema';
import { getOpenApiComponentsObject } from './components';

export const openApiVersion = '3.0.3';

export type GenerateOpenApiDocumentOptions = {
  title: string;
  description?: string;
  version: string;
  baseUrl: string;
  docsUrl?: string;
  tags?: string[];
  securitySchemes?: OpenAPIV3.ComponentsObject['securitySchemes'];
};

export const generateOpenApiDocument = (
  appRouter: OpenApiRouter,
  opts: GenerateOpenApiDocumentOptions,
): OpenAPIV3.Document => {
  const securitySchemes = opts.securitySchemes || {
    Authorization: {
      type: 'http',
      scheme: 'bearer',
    },
  };
  const components = getOpenApiComponentsObject(appRouter, Object.keys(securitySchemes));
  const paths = getOpenApiPathsObject(appRouter, Object.keys(securitySchemes));

  // console.log(components);
  return {
    openapi: openApiVersion,
    info: {
      title: opts.title,
      description: opts.description,
      version: opts.version,
    },
    servers: [
      {
        url: opts.baseUrl,
      },
    ],
    paths,
    components: {
      securitySchemes,
      responses: {
        error: errorResponseObject,
      },
      schemas: {
        ...components.schemas,
      },
    },
    tags: opts.tags?.map((tag) => ({ name: tag })),
    externalDocs: opts.docsUrl ? { url: opts.docsUrl } : undefined,
  };
};
