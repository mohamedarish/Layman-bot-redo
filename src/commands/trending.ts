import { EmbedBuilder } from "@discordjs/builders";
import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import { trending } from "../api";
import { BotCommand } from "../structures";

class Trending extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("trending")
                .setDescription(
                    "View trending movie/tv show/both from the curren week or today"
                )
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("The type of search to do")
                        .addChoices(
                            { name: "all", value: "all" },
                            { name: "movie", value: "movie" },
                            { name: "tv", value: "tv" },
                            { name: "person", value: "person" }
                        )
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("time-frame")
                        .setDescription("The time frame to search for")
                        .addChoices(
                            { name: "day", value: "day" },
                            { name: "week", value: "week" }
                        )
                        .setRequired(true)
                )
                .toJSON()
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<void> {
        const type = interaction.options.getString("type");
        const time = interaction.options.getString("time-frame");

        if (!type || !time) return;

        const trendingMovies = await trending(type, time);

        if (!trendingMovies) return;

        if (!trendingMovies.total_results) return;

        const trendingEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(
                `Top trending movies of ${
                    time === "day" ? "today" : "this week"
                }`
            )
            .setDescription("The trending movies right now are:");

        if (!trendingMovies.results) return;

        let flag = true;

        trendingMovies.results.forEach((movie) => {
            if (flag && movie.poster_path) {
                trendingEmbed.setThumbnail(
                    "https://image.tmdb.org/t/p/w500/" + movie.poster_path
                );
                flag = false;
            }

            trendingEmbed.addFields({
                name: movie.title ? movie.title : "No title found",
                value: movie.overview
            });
        });

        interaction.reply({
            embeds: [trendingEmbed],
            ephemeral: true
        });
    }
}

export default new Trending();
