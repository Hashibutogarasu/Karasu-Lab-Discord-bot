import { createBot, getBotIdFromToken, startBot, Intents, CreateSlashApplicationCommand, Bot, Interaction } from "@discordeno/mod.ts";
import { post } from "https://deno.land/x/dishooks@v1.1.0/mod.ts";
import "$std/dotenv/load.ts"

const WebHookURL: string = Deno.env.get("WEBHOOK_URL")!;

export interface SlashCommand {
  info: CreateSlashApplicationCommand;
  response(bot: Bot, interaction: Interaction): Promise<void>;
};

class KLabBot {
  private bot: Bot;

  public static log(message: string) {
    const now = new Date();
    console.log(`[${now.toISOString()}] ${message}`);
  }

  constructor(bot: Bot) {
    this.bot = bot;
  }

  static createBot(BotToken: string, commands: SlashCommand[]): KLabBot {
    const bot = createBot({
      token: BotToken,
      botId: getBotIdFromToken(BotToken) as bigint,
      intents: Intents.Guilds | Intents.GuildMessages,
      events: {
        ready: async (_bot, payload) => {
          const content = `${payload.user.username} is ready!`;
          KLabBot.log(content);

          try {
            await post(
              WebHookURL,
              {
                embeds: [
                  {
                    title: "KLabBot",
                    description: content,
                    color: 2326507,
                  }
                ]
              },
            );
          }
          catch (error) {
            console.error(error);
          }
        },
        interactionCreate: async (_bot, interaction) => {
          for (const command of commands.values()) {
            if (interaction.data?.name === command.info.name) {
              await command.response(_bot, interaction);
            }
          }
        }
      }
    });

    for (const command of commands) {
      bot.helpers.createGlobalApplicationCommand(command.info);
      bot.helpers.upsertGlobalApplicationCommands([command.info]);
    }

    return new KLabBot(bot);
  }

  async start(): Promise<void> {
    await startBot(this.bot);
  }
}

export { KLabBot };