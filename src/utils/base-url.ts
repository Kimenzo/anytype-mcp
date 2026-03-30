import { URL } from "node:url";
import { OpenAPIV3 } from "openapi-types";

const BASE_URL_ENV_KEYS = ["BENTO_API_BASE_URL", "ANYTYPE_API_BASE_URL"] as const;

type BaseUrlEnvConfig = {
  endpoint: string;
  key: (typeof BASE_URL_ENV_KEYS)[number];
};

/**
 * Parses the Bento/legacy Anytype API base URL environment variables and returns the origin.
 * Returns null if not set, invalid, or uses an unsupported protocol.
 */
export function parseBaseUrlFromEnv(): BaseUrlEnvConfig | null {
  for (const key of BASE_URL_ENV_KEYS) {
    const endpoint = process.env[key];
    if (!endpoint) {
      continue;
    }

    try {
      const url = new URL(endpoint);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        console.warn(`${key} must use http:// or https:// protocol, got: ${url.protocol}. Ignoring and using fallback.`);
        continue;
      }
      return { endpoint: url.origin, key };
    } catch (error) {
      console.warn(`Failed to parse ${key} environment variable:`, error);
      continue;
    }
  }
  return null;
}

/**
 * Determines the base URL using priority order:
 * 1. BENTO_API_BASE_URL or legacy ANYTYPE_API_BASE_URL environment variable
 * 2. OpenAPI spec servers[0].url
 * 3. Default fallback: http://127.0.0.1:31009
 */
export function determineBaseUrl(openApiSpec?: OpenAPIV3.Document): string {
  // Priority 1: Environment variable
  const envConfig = parseBaseUrlFromEnv();
  if (envConfig) {
    console.error(`Using base URL from ${envConfig.key}: ${envConfig.endpoint}`);
    return envConfig.endpoint;
  }

  // Priority 2: OpenAPI spec servers[0].url
  const specUrl = openApiSpec?.servers?.[0]?.url;
  if (specUrl) {
    console.error(`Using base URL from OpenAPI spec: ${specUrl}`);
    return specUrl;
  }

  // Priority 3: Default fallback
  const defaultUrl = "http://127.0.0.1:31009";
  console.error(`Using default base URL: ${defaultUrl}`);
  return defaultUrl;
}

/**
 * Gets the default OpenAPI spec URL.
 * If BENTO_API_BASE_URL or legacy ANYTYPE_API_BASE_URL is set, uses it with /docs/openapi.json suffix.
 * Otherwise, returns the default spec URL.
 */
export function getDefaultSpecUrl(): string {
  const envConfig = parseBaseUrlFromEnv();
  if (envConfig) {
    return `${envConfig.endpoint}/docs/openapi.json`;
  }
  return "http://127.0.0.1:31009/docs/openapi.json";
}
