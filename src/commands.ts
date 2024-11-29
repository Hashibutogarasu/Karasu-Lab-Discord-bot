import { CreateSlashApplicationCommand, Bot, Interaction, InteractionResponseTypes, ApplicationCommandTypes } from "@discordeno/mod.ts";
import "$std/dotenv/load.ts"
import { GeminiAPI } from "./gemini.ts";
import "$std/dotenv/load.ts"
import { getFileFromUrl, getFileNamefromUrl, putImage } from "./upload.ts";

interface SlashCommand {
  info: CreateSlashApplicationCommand;
  response(bot: Bot, interaction: Interaction): Promise<void>;
};


const GeminiAPIKey: string = Deno.env.get("GEMINI_API_KEY")!;

export const GeminiCommand: SlashCommand = {
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
            timestamp: Date.now(),
          }
        ],
        flags: 1 << 6
      }
    });
  }
}

export const AboutCommand: SlashCommand = {
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

export const UploadCommand: SlashCommand = {
  info: {
    name: "upload",
    description: "画像をアップロード",
    type: ApplicationCommandTypes.Message,
  },
  response: async (bot, interaction) => {
    await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        embeds: [
          {
            title: "アップロード中",
            color: 0x00ff00,
            description: "画像をアップロードしています...",
            timestamp: Date.now(),
          }
        ],
        flags: 1 << 6
      }
    });

    const urls = interaction.data?.resolved?.messages?.map(async (message) => {
      const attachment = message.attachments?.[0];
      const url = await putImage(await getFileFromUrl(attachment.url), `discord/${getFileNamefromUrl(attachment.url)}`, attachment.contentType!);

      return url;
    });

    //url is [object Promise] so we need to await it
    const url = urls ? await Promise.all(urls) : [];

    return await bot.helpers.editOriginalInteractionResponse(interaction.token, {
      embeds: [
        {
          title: "アップロード完了",
          color: 0x00ff00,
          description: url[0],
          image: {
            url: url[0]
          },
          timestamp: Date.now(),
        }
      ],
    }) as void;
  }
}