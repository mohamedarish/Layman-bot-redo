import { Client, Collection, GatewayIntentBits } from "discord.js";
import BotCommand from "./BotCommand";
import { eventFiles } from "../files";
import { IBotEvent } from "../types";


export default class Bot extends Client<true> {
    public commands = new Collection<string, BotCommand>();

    constructor () {
        super({
            intents: [
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.Guilds
            ]
        });
    }

    async start() {
        await this.initModules();
        await this.login(process.env.BOT || "");
    }

    async initModules() {
        const tasks: Promise<unknown>[] = [];

        for (let i = 0; i  < eventFiles.length; i += 1) {
            const file = eventFiles[i];
            const task = import(file);
            task.then(module => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const event = module.default as IBotEvent<any>;

                if (!event) {
                    console.error(
                        `File at ${file} seems to be incorrectly exporting an event`
                    );
                } else {
                    if (event.once) {
                        this.once(event.eventName, event.run.bind(null, this));
                    } else {
                        this.on(event.eventName, event.run.bind(null, this));
                    }
                }
                tasks.push(task);
            });
        }
        await Promise.all(tasks);
    }
}