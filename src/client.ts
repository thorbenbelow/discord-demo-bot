import {Client, Collection, Events, GatewayIntentBits} from 'discord.js';
import * as dotenv from 'dotenv';
import {Command} from './commands/command';
import ping from './commands/ping';
import votekick from './commands/votekick';

dotenv.config();

class CommandClient extends Client {
  public commands = new Collection<string, Command>();

  registerCommands(...commands: Command[]): void {
    for (const command of commands) {
      this.commands.set(command.command.name, command);
    }
  }
}

const client = new CommandClient({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions]});

client.registerCommands(
    ping,
    votekick,
);

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as user ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  const command = (interaction.client as CommandClient).commands.get(interaction.commandName);

  if (!command) {
    console.error(`NotFound  ${interaction.commandName}`);
    return;
  }

  console.error(`Ok  ${interaction.commandName}`);

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

await client.login(process.env.DISCORD_TOKEN);
