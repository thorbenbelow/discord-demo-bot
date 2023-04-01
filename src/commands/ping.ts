import {Client, CommandInteraction, SlashCommandBuilder} from 'discord.js';

const command = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

async function execute(interaction: CommandInteraction, client: Client) {
  await interaction.reply('Pong!');
}

export default {command, execute};
