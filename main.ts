import { createBot, getBotIdFromToken, startBot, Intents, CreateSlashApplicationCommand, Bot, Interaction, InteractionResponseTypes } from "@discordeno/mod.ts";
import log4js from "npm:log4js";

import "$std/dotenv/load.ts"

log4js.configure({
    appenders: { bot: { type: "file", filename: "bot.log" } },
    categories: { default: { appenders: ["bot"], level: "error" } },
});

const logger = log4js.getLogger();
logger.level = "debug";

function log(message: string) {
    logger.debug(message);
    console.log(message);
}

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

const bot = createBot({
    token: BotToken,
    botId: getBotIdFromToken(BotToken) as bigint,
    intents: Intents.Guilds | Intents.GuildMessages,
    events: {

        ready: (_bot, payload) => {
            log(`${payload.user.username} is ready!`);
        },
        interactionCreate: async (_bot, interaction) => {
            await HelloCommand.response(bot, interaction);
        }
    }
});

bot.helpers.createGlobalApplicationCommand(HelloCommand.info);
bot.helpers.upsertGlobalApplicationCommands([HelloCommand.info]);

await startBot(bot);

Deno.cron("Continuous Request", "*/2 * * * *", () => {
    log("running...");
});