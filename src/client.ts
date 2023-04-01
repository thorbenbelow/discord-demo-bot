import {Client, Collection, Events, GatewayIntentBits} from 'discord.js';
import * as dotenv from 'dotenv';
import {Command} from './commands/command';
import ping from './commands/ping';

dotenv.config();

class CommandClient extends Client {
  public commands = new Collection<string, Command>();

  registerCommand(command: Command) {
    this.commands.set(command.command.name, command);
  }
}

const client = new CommandClient({intents: GatewayIntentBits.Guilds});

client.registerCommand(ping);

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as user ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  console.log(interaction);
  const command = (interaction.client as CommandClient).commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

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
