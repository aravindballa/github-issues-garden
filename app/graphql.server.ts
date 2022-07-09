import { createClient } from "@urql/core";
import invariant from "tiny-invariant";

let token = Deno.env.get("GITHUB_TOKEN");
let env = Deno.env.get("ENV");
invariant(token, "GITHUB_TOKEN must be set in an .env file");

const client = createClient({
  url: "https://api.github.com/graphql",
  fetchOptions: {
    headers: { Authorization: `bearer ${token}` },
  },
  requestPolicy: env === "production" ? "cache-first" : "network-only",
});

export default client;
