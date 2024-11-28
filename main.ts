import { CreateSlashApplicationCommand, Bot, Interaction, InteractionResponseTypes } from "@discordeno/mod.ts";
import "$std/dotenv/load.ts"
import { KLabBot } from "./src/klabbot.ts";
import { GeminiAPI } from "./src/gemini.ts";

interface SlashCommand {
    info: CreateSlashApplicationCommand;
    response(bot: Bot, interaction: Interaction): Promise<void>;
};

const BotToken: string = Deno.env.get("BOT_TOKEN")!;
const GeminiAPIKey: string = Deno.env.get("GEMINI_API_KEY")!;

const AboutCommand: SlashCommand = {
    info: {
        name: "about",
        description: "このBotについて"
    },
    response: async (bot, interaction) => {
        return await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
                embeds: [
                    {
                        author: {
                            name: "KLabBot",
                        },
                        color: 0x00ff00,
                        description: "KLabBotはDenoのDiscordenoモジュールを使って作られたBotです。",
                    }
                ],
                flags: 1 << 6
            }
        });
    }
}

const GeminiCommand: SlashCommand = {
    info: {
        name: "gemini",
        description: "Geminiで文章を生成",
        options: [
            {
                name: "text",
                description: "生成する文章の元になるテキスト",
                type: 3,
                required: true
            }
        ]
    },
    response: async (bot, interaction) => {
        const gemini = GeminiAPI.createClient(GeminiAPIKey);
        const input = interaction.data?.options?.filter(option => option.name === "text")[0].value as string;

        const content = await gemini.generateContent(input);

        return await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
                embeds: [
                    {
                        title: `Gemini - ${gemini.getModel()} ${gemini.getVersion()}`,
                        color: 0x00ff00,
                        description: content.candidates[0].content.parts.map(part => part.text).join(""),
                    }
                ],
                flags: 1 << 6
            }
        });
    }
}

const klabbot = KLabBot.createBot(BotToken, [AboutCommand, GeminiCommand]);
klabbot.start();

Deno.cron("Continuous Request", "*/2 * * * *", () => {
    KLabBot.log("running...");
});