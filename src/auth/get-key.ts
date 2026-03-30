import axios from "axios";
import * as readline from "readline";

interface AuthToken {
  api_key: string;
}

export class ApiKeyGenerator {
  private readonly rl: readline.Interface;
  private readonly appName: string = "bento_mcp_server";
  private readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private prompt(question: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  private displaySuccessMessage(apiKey: string, apiVersion: string): void {
    console.log(`\nYour API KEY: ${apiKey}`);
    console.log("\nAdd this to your MCP settings file as:");
    console.log(`
{
  "mcpServers": {
    "bento": {
      "command": "npx",
      "args": [
        "-y",
        "@kimenzo/bento-mcp",
      ],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\\"Authorization\\":\\"Bearer ${apiKey}\\", \\"Bento-Version\\":\\"${apiVersion}\\"}"
      }
    }
  }
}
`);
  }

  /**
   * Start the authentication process with Bento
   * @returns Challenge ID to use with completeAuthentication
   */
  private async startAuthentication(): Promise<string> {
    try {
      const response = await axios.post(`${this.basePath}/v1/auth/challenges`, { app_name: this.appName });

      if (!response.data?.challenge_id) {
        throw new Error("Failed to get challenge ID");
      }

      return response.data.challenge_id;
    } catch (error) {
      console.error("Authentication error:", error instanceof Error ? error.message : error);
      throw new Error("Failed to start authentication");
    }
  }

  /**
   * Complete the authentication process using the challenge ID and display code
   * @param challengeId Challenge ID from startAuthentication
   * @param code Display code shown in Bento desktop
   * @returns Authentication tokens
   */
  private async completeAuthentication(
    challengeId: string,
    code: string,
  ): Promise<{ apiKey: string; apiVersion: string }> {
    try {
      const response = await axios.post<AuthToken>(`${this.basePath}/v1/auth/api_keys`, {
        challenge_id: challengeId,
        code: code,
      });

      if (!response.data?.api_key) {
        throw new Error("Authentication failed: No api key received");
      }

      return {
        apiKey: response.data.api_key,
        apiVersion: response.headers["bento-version"] ?? response.headers["anytype-version"] ?? "2025-11-08",
      };
    } catch (error) {
      console.error("Authentication error:", error instanceof Error ? error.message : error);
      throw new Error("Failed to complete authentication");
    }
  }

  public async generateApiKey(): Promise<void> {
    try {
      console.log("Starting authentication to get API key...");

      const challengeId = await this.startAuthentication();
      console.log("Please check Bento Desktop for the 4-digit code");
      const code = await this.prompt("Enter the 4-digit code shown in Bento Desktop: ");

      const { apiKey, apiVersion } = await this.completeAuthentication(challengeId, code);
      console.log("Authenticated successfully!");
      this.displaySuccessMessage(apiKey, apiVersion);
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}
