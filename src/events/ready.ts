import { REST, Routes } from "discord.js";
import { commandFiles } from "../files";
import { Bot, BotCommand } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "ready",
    once: true,
    run: async (client: Bot) => {
        console.log(`Logged in as ${client.user.tag}`);

        const commandArr: BotCommand[] = [];

        let tasks: Promise<unknown>[] = [];

        for (let i = 0; i < commandFiles.length; i += 1) {
            const file = commandFiles[i];
            const task = import(file);

            task.then((module) => {
                const command = module.default as BotCommand;

                if (command === undefined) {
                    console.error(`There seems to be a problem with ${file}`);
                } else {
                    commandArr.push(command);
                }
            });
            tasks.push(task);
        }

        await Promise.all(tasks);

        commandArr.forEach(command => {
            client.commands.set(command.data.name, command);
        });

        const payload = commandArr.map(cmd => cmd.data);

        tasks = [];

        const rest = new REST({version: "10"}).setToken(
            process.env.BOT || ""
        );

        await rest.put(Routes.applicationCommands(client.user.id),
            {body: payload}
        );
        console.log("Succesfully registered slash commands");
    },
});
