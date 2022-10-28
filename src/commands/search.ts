import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";
import { search } from "../api";
import { BotCommand } from "../structures";

class Search extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("search")
                .setDescription("Search for a movie or tv show")
                .addStringOption((option) =>
                    option
                        .setName("query")
                        .setDescription("the movie/tv series name")
                        .setRequired(true)
                )
                .toJSON()
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<void> {
        const query = interaction.options.getString("query");

        if (!query) return;

        const movieResults = await search(query);

        if (!movieResults) return;

        console.log(movieResults);

        interaction.reply({
            content: `Found ${movieResults.results?.length} results out of a total possible ${movieResults.total_results}`,
            ephemeral: true,
        });
    }
}

export default new Search();
