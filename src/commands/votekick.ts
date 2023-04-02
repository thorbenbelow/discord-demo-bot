import {ButtonStyle, Client, CommandInteraction, SlashCommandBuilder} from 'discord.js';

const YES = '👍';
const NO = '👎';

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
    console.log('Caller not in a voice channel.');
    return;
  }

  if (caller.voice.channelId !== user.voice.channelId) {
    console.log('Caller and user are in different voice channels');
    await caller.voice.disconnect('Bitte nicht abfucken');
    return;
  }

  const permissibleVotes = caller.voice.channel.members;
  const requiredVotes = Math.ceil(permissibleVotes.size / 2);

  const message = await interaction.reply({
    content: `${caller.displayName} wants to kick ${user.displayName} (Required votes: ${requiredVotes}). You have 10 seconds to cast your vote.`,
    fetchReply: true,
  });
  await Promise.all([
    message.react(YES),
    message.react(NO),
  ]);

  const collector = message.createReactionCollector({time: 10000});
  collector.on('end', async (collected) => {
    const votes = {
      yes: collected.find((r) => r.emoji.name === YES)?.users?.valueOf()?.size || 0,
      no: collected.find((r) => r.emoji.name === NO)?.users?.valueOf()?.size || 0,
    };
    const result = votes.yes >= requiredVotes ?
      {
        user,
        msg: `Vote succeded with ${votes.yes} to ${votes.no}. ${user.displayName} will be kicked :)`,
      } :

      {
        user: caller,
        msg: `Vote failed with ${votes.yes} to ${votes.no}. ${caller.displayName} will be kicked instead :)`,
      };

    await result.user.voice.disconnect('votekick :)');
    await interaction.followUp(result.msg);
  });
}

export default {command, execute};
