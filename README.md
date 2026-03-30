# Bento MCP Server

`@kimenzo/bento-mcp` is the Bento MCP server for the local Bento desktop API.

It turns Bento's OpenAPI surface into MCP tools so Claude, Cursor, LM Studio, and other MCP clients can search spaces, create objects, manage templates, and operate on Bento data through natural language.

The package is MIT-licensed and is maintained in this fork:

- Repository: `https://github.com/Kimenzo/anytype-mcp`
- npm package: `@kimenzo/bento-mcp`

## Quick Start

### 1. Create an API key in Bento

1. Open Bento Desktop.
2. Go to `Settings`.
3. Open `API Keys`.
4. Create a new key.

You can also generate a ready-to-copy config snippet from the CLI:

```bash
npx -y @kimenzo/bento-mcp get-key
```

### 2. Configure your MCP client

Use this snippet in Claude Desktop, Cursor, Windsurf, Raycast, or any MCP-compatible client:

```json
{
  "mcpServers": {
    "bento": {
      "command": "npx",
      "args": ["-y", "@kimenzo/bento-mcp"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\":\"Bearer <YOUR_API_KEY>\", \"Bento-Version\":\"2025-11-08\"}"
      }
    }
  }
}
```

The server will translate `Bento-Version` to the legacy `Anytype-Version` header automatically when talking to the current backend, so Bento branding and backend compatibility can coexist during migration.

### Claude Code

```bash
claude mcp add bento \
  -e OPENAPI_MCP_HEADERS='{"Authorization":"Bearer <YOUR_API_KEY>", "Bento-Version":"2025-11-08"}' \
  -s user -- npx -y @kimenzo/bento-mcp
```

### Global install

```bash
npm install -g @kimenzo/bento-mcp
```

Then point your MCP client at `bento-mcp`.

## Custom API Base URL

By default, the server connects to `http://127.0.0.1:31009`.

Preferred override:

- `BENTO_API_BASE_URL`

Legacy compatibility fallback:

- `ANYTYPE_API_BASE_URL`

Example:

```json
{
  "mcpServers": {
    "bento": {
      "command": "npx",
      "args": ["-y", "@kimenzo/bento-mcp"],
      "env": {
        "BENTO_API_BASE_URL": "http://localhost:31012",
        "OPENAPI_MCP_HEADERS": "{\"Authorization\":\"Bearer <YOUR_API_KEY>\", \"Bento-Version\":\"2025-11-08\"}"
      }
    }
  }
}
```

## Development

Clone and build locally:

```bash
git clone https://github.com/Kimenzo/anytype-mcp.git
cd anytype-mcp
npm install
npm run build
```

Useful commands:

```bash
npm run dev
npm run test
npm run typecheck
npm run lint
npm run pack:check
```

## Publishing

The package is already prepared for public npm publishing:

- package name: `@kimenzo/bento-mcp`
- public access enabled through `publishConfig.access`
- `prepublishOnly` runs build, tests, and typecheck before publish

Publish flow:

```bash
npm login
npm run pack:check
npm publish --access public
```

## Notes

- The package ships both `bento-mcp` and `anytype-mcp` CLI bin aliases for transition safety.
- The runtime is Bento-branded, but still preserves current backend compatibility where the API surface still exposes `Anytype-Version`.

Licensed under [MIT](./LICENSE.md).
