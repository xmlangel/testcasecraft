import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  username?: string;
}

const TOKEN_PATH =
  process.env.TESTCASECRAFT_TOKEN_PATH ??
  path.join(os.homedir(), ".testcasecraft-mcp", "token.json");

export async function saveToken(tokens: TokenSet): Promise<void> {
  const dir = path.dirname(TOKEN_PATH);
  try {
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  } catch (e: any) {
    if (e.code !== "EEXIST") throw e;
  }
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), {
    mode: 0o600,
  });
}

export async function loadTokenSet(): Promise<TokenSet | null> {
  try {
    const raw = await fs.readFile(TOKEN_PATH, "utf-8");
    return JSON.parse(raw) as TokenSet;
  } catch (e: any) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

export async function getToken(): Promise<string | null> {
  const set = await loadTokenSet();
  return set?.accessToken ?? null;
}

export async function clearToken(): Promise<void> {
  try {
    await fs.unlink(TOKEN_PATH);
  } catch (e: any) {
    if (e.code !== "ENOENT") throw e;
  }
}
