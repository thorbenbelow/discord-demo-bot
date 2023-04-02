import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  CommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const command = new SlashCommandBuilder()
    .setName('votekick')
    .setDescription('Vote to kick someone off the server')
    .addUserOption((option) => option
        .setName('user')
        .setDescription('The user that you want to disconnect')
        .setRequired(true),
    );

async function execute(interaction: CommandInteraction, client: Client): Promise<void> {
  const guild = await client.guilds.fetch(interaction.guildId);

  const caller = await guild.members.fetch({user: interaction.user.id, force: true});
  const user = await guild.members.fetch({
    user: interaction.options.getUser('user').id,
    force: true,
  });

  if (!caller.voice.channelId) {
    return;
  }

  if (caller.voice.channelId !== user.voice.channelId) {
    await caller.voice.disconnect('Bitte nicht abfucken');
    return;
  }

  console.log({caller});

  const permissibleVotes = caller.voice.channel.members;
  const votes = {yes: 0, no: 0};
  const requiredVotes = permissibleVotes.size / 2;

  const voteActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('votekick_yes').setLabel('Yes').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('votekick_no').setLabel('No').setStyle(ButtonStyle.Danger),
  );

  const collector = interaction.channel.createMessageComponentCollector({
    filter: (i) => i.customId === 'votekick_yes' || i.customId === 'votekick_no',
    time: 10000,
  });

  collector.on('collect', async (vote) => {
    if (vote.customId === 'votekick_yes') {
      if (permissibleVotes.has(vote.user.id)) {
        votes.yes += 1;
      }
      await vote.update({content: 'You voted Yes.', components: []});
    } else {
      if (permissibleVotes.has(vote.user.id)) {
        votes.no += 1;
      }
      await vote.update({content: 'You voted No.', components: []});
    }
  });

  let result;
  collector.on('end', (collected) => {
    if (votes.yes > requiredVotes) {
      result = `Vote to kick ${user.displayName} succeeded.`;
      user.voice.disconnect('Votekick');
    } else {
      result = `Vote to kick ${user.displayName} failed. ${caller.displayName} will be kicked instead.`;
      caller.voice.disconnect('Votekick');
    }

    interaction.followUp({content: result || 'Oops. Something went wrong :('});
  });

  const response = await interaction.reply({
    content: `${caller.displayName} wants to kick ${user.displayName}. You have 10 seconds to cast your vote.`,
    // components: [voteActions],
    ephemeral: true,
  });
}

export default {command, execute};
