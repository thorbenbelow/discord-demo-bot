import {REST, Routes} from 'discord.js';
import ping from './commands/ping';
import * as dotenv from 'dotenv';
import votekick from './commands/votekick';

dotenv.config();

const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN);

const commands = [
  ping,
  votekick,
].map((c) => c.command.toJSON());

try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`);

  await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {body: commands},
  );

  console.log(`Successfully reloaded application (/) commands.`);
} catch (error) {
  console.error(error);
}
