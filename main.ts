import { CreateSlashApplicationCommand, Bot, Interaction, InteractionResponseTypes } from "@discordeno/mod.ts";
import "$std/dotenv/load.ts"
import { KLabBot } from "./src/klabbot.ts";

interface SlashCommand {
    info: CreateSlashApplicationCommand;
    response(bot: Bot, interaction: Interaction): Promise<void>;
};

const BotToken: string = Deno.env.get("BOT_TOKEN")!;
const HelloCommand: SlashCommand = {
    info: {
        name: "hello_world",
        description: "こんにちはと返します。"
    },

    response: async (bot, interaction) => {
        return await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
                content: "こんにちは",

                flags: 1 << 6
            }
        });
    }
}

const klabbot = KLabBot.createBot(BotToken, [HelloCommand]);
klabbot.start();

Deno.cron("Continuous Request", "*/2 * * * *", () => {
    KLabBot.log("running...");
});