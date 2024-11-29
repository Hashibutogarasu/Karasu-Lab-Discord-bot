import "$std/dotenv/load.ts"
import { KLabBot } from "./src/klabbot.ts";
import commands from "./src/commands.ts";

const BotToken: string = Deno.env.get("BOT_TOKEN")!;

const klabbot = KLabBot.createBot(BotToken, commands);
klabbot.start();

Deno.cron("Continuous Request", "*/2 * * * *", () => {
    KLabBot.log("running...");
});