import { KLabBot } from "./src/klabbot.ts";
import commands from "./src/commands.ts";
import Environments from "./src/keys.ts";

const klabbot = KLabBot.createBot(Environments.BOT_TOKEN, commands);
klabbot.start();

Deno.cron("Continuous Request", "*/2 * * * *", () => {
    KLabBot.log("running...");
});
