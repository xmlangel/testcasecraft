import Resolver from "@forge/resolver";
import { kvs } from "@forge/kvs";

const resolver = new Resolver();

resolver.define("save-config", async (req) => {
  const { url, apiKey } = req.payload;
  await kvs.set("server-url", url);
  await kvs.setSecret("api-key", apiKey);
  return true;
});

resolver.define("get-config", async () => {
  const url = await kvs.get("server-url");
  const apiKey = await kvs.getSecret("api-key");
  return { url, apiKey };
});

export const handler = resolver.getDefinitions();
