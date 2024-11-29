import "$std/dotenv/load.ts"

const Environments = {
  BOT_TOKEN: Deno.env.get("BOT_TOKEN") as string,
  GEMINI_API_KEY: Deno.env.get("GEMINI_API_KEY") as string,
  WEBHOOK_URL: Deno.env.get("WEBHOOK_URL") as string,
  CLOUDFLARE_ENDPOINT: Deno.env.get("CLOUDFLARE_ENDPOINT") as string,
  CLOUDFLARE_ACCESS_KEY_ID: Deno.env.get("CLOUDFLARE_ACCESS_KEY_ID") as string,
  CLOUDFLARE_ACCESS_KEY: Deno.env.get("CLOUDFLARE_ACCESS_KEY") as string,
  IMAGE_HOST_URL: Deno.env.get("IMAGE_HOST_URL") as string,
}

export default Environments;