import { createBot, getBotIdFromToken, startBot, Intents, CreateSlashApplicationCommand, Bot, Interaction } from "@discordeno/mod.ts";

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
        ready: (_bot, payload) => {
          KLabBot.log(`${payload.user.username} is ready!`);
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