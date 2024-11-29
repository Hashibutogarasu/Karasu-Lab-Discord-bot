import "$std/dotenv/load.ts"
import { KLabBot } from "./src/klabbot.ts";
import { AboutCommand, GeminiCommand, UploadCommand } from "./src/commands.ts";

const BotToken: string = Deno.env.get("BOT_TOKEN")!;

const klabbot = KLabBot.createBot(BotToken, [AboutCommand, GeminiCommand, UploadCommand]);
klabbot.start();

Deno.cron("Continuous Request", "*/2 * * * *", () => {
    KLabBot.log("running...");
});