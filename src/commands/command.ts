import {Client, CommandInteraction, SlashCommandBuilder} from 'discord.js';

export interface Command {
  command: Partial<SlashCommandBuilder>,

  execute(interaction: CommandInteraction, client: Client): Promise<void>
}
