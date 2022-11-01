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

        const res = await trending(type, time);

        if (!res) return;

        if (!res.total_results) return;

        if (!res.results) return;

        const trendingMovies = res.results;

        while (trendingMovies.length > 10) {
            trendingMovies.pop();
        }

        const embed = new EmbedBuilder()
            .setTitle(`The most popular ${type} of this ${time}}`)
            .setThumbnail("https://i.imgur.com/44ueTES.png")
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL()
                    ? interaction.user.avatarURL()?.toString()
                    : interaction.user.displayAvatarURL.toString()
            });

        trendingMovies.forEach((movie) => {
            embed.addFields({
                name: movie.title
                    ? movie.title
                    : movie.name
                    ? movie.name
                    : "No title found",
                value: movie.overview
                    ? `${movie.overview.substring(0, 49)}...`
                    : movie.known_for_department
                    ? movie.known_for_department
                    : "No valid overview found"
            });
        });

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}

export default new Trending();
