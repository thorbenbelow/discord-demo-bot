import {CommandInteraction, SlashCommandBuilder} from 'discord.js';

const command = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

async function execute(interaction: CommandInteraction) {
  await interaction.reply('Pong!');
}

export default {command, execute};
