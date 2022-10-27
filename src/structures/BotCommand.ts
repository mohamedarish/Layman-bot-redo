import {
    BaseInteraction,
    RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import Bot from "./Bot";

export default abstract class BotCommand {
    public readonly data: RESTPostAPIApplicationCommandsJSONBody;

    protected constructor(data: RESTPostAPIApplicationCommandsJSONBody) {
        this.data = data;
    }

    public abstract execute(
        interaction: BaseInteraction,
        client: Bot
    ): Promise<void>;
}
