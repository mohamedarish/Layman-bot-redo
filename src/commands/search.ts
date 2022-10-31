import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder
} from "@discordjs/builders";
import {
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder
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

        const res = await search(query);

        if (!res) return;

        const movieResults = {
            page: res.page,
            results: res.results?.filter((el) => el.title),
            totalPages: res.total_pages,
            totalResults: res.total_results
        };

        if (!movieResults) return;

        if (
            !movieResults.results ||
            !movieResults.page ||
            !movieResults.totalPages ||
            !movieResults.totalResults
        )
            return;
    }
}

export default new Search();
