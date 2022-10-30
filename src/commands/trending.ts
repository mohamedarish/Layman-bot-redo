import { EmbedBuilder } from "@discordjs/builders";
import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
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

        const res = await trending(type, time);

        if (!res) return;

        if (!res.total_results) return;

        const trendingEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(
                `Top trending movies of ${
                    time === "day" ? "today" : "this week"
                }`
            )
            .setDescription(
                `The trending ${
                    type === "movie"
                        ? "movies"
                        : type === "tv"
                        ? "series"
                        : type === "person"
                        ? "celebrities"
                        : "from all categories are"
                } right now are:`
            );

        if (!res.results) return;

        const trendingMovies = res.results;

        while (trendingMovies.length > 10) {
            trendingMovies.pop();
        }

        let flag = true;

        trendingMovies.forEach((movie) => {
            if (flag && movie.poster_path) {
                trendingEmbed.setThumbnail(
                    "https://image.tmdb.org/t/p/w500/" + movie.poster_path
                );
                flag = false;
            }

            trendingEmbed.addFields({
                name: movie.title
                    ? `[${movie.title}](https://www.themoviedb.org/${type}/${movie.id})`
                    : movie.original_title
                    ? `[${movie.original_title}](https://www.themoviedb.org/${type}/${movie.id})`
                    : movie.name
                    ? `[${movie.name}](https://www.themoviedb.org/${type}/${movie.id})`
                    : movie.orignial_name
                    ? `[${movie.orignial_name}](https://www.themoviedb.org/${type}/${movie.id})`
                    : "No title found",
                value: movie.overview
                    ? movie.overview.length > 50
                        ? movie.overview.slice(0, 51) + "..."
                        : movie.overview
                    : movie.known_for_department
                    ? movie.known_for_department
                    : "No data found on actor",
            });
        });

        interaction.reply({
            embeds: [trendingEmbed],
            ephemeral: true,
        });
    }
}

export default new Trending();
