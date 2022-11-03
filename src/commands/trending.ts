import {
    ActionRowBuilder,
    EmbedBuilder,
    SelectMenuBuilder,
    SelectMenuOptionBuilder
} from "@discordjs/builders";
import {
    CacheType,
    ChatInputCommandInteraction,
    ComponentType,
    SlashCommandBuilder
} from "discord.js";
import { getMovieData, trending } from "../api";
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
                            { name: "tv", value: "tv" }
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
            })
            .setColor(0x44ff22);

        const trendingSelect = new SelectMenuBuilder()
            .setCustomId("trendingSelect")
            .setPlaceholder(
                "Select an option from this menu to view the movie details"
            );

        trendingMovies.forEach((movie) => {
            trendingSelect.addOptions(
                new SelectMenuOptionBuilder()
                    .setLabel(
                        movie.title
                            ? movie.title
                            : movie.name
                            ? movie.name
                            : "No title found"
                    )
                    .setDescription(`⭐️ ${movie.vote_average}`)
                    .setValue(trendingMovies.indexOf(movie).toString())
            );

            embed.addFields({
                name: movie.title
                    ? `${trendingMovies.indexOf(movie) + 1}. ${movie.title}`
                    : movie.name
                    ? `${trendingMovies.indexOf(movie) + 1}. ${movie.name}`
                    : "No title found",
                value: movie.first_air_date
                    ? `${movie.first_air_date}\t⭐️${movie.vote_average}`
                    : movie.release_date
                    ? `${movie.release_date}\t⭐️${movie.vote_average}`
                    : movie.known_for_department
                    ? `${movie.known_for_department}\t🌟${movie.popularity}`
                    : "No valid data found"
            });
        });

        const actionRow =
            new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                trendingSelect
            );

        const trendingReply = await interaction.reply({
            embeds: [embed],
            components: [actionRow]
        });

        const collector = trendingReply.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 40000
        });

        collector.on("collect", async (m) => {
            if (!m.values) return;

            const selection = parseInt(m.values[0]);

            const movie = trendingMovies[selection];

            const vi = await getMovieData(
                movie.media_type ? movie.media_type : type,
                movie.id
            );

            if (!vi) return;

            const trendingMovie = new EmbedBuilder()
                .setColor(0xff5544)
                .setTitle(
                    movie.title
                        ? `${movie.title}\t⭐️(${movie.vote_average})`
                        : movie.name
                        ? movie.vote_average
                            ? `${movie.name}\t⭐️(${movie.vote_average})`
                            : movie.popularity
                            ? `${movie.name}\t🌟(${movie.popularity})`
                            : movie.name
                        : "No title or name found"
                )
                .setURL(vi.imdb)
                .setDescription(
                    movie.overview
                        ? movie.overview
                        : movie.known_for_department
                        ? movie.known_for_department
                        : "No valid description found"
                )
                .setImage(
                    movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : movie.profile_path
                        ? `https://image.tmdb.org/t/p/w500${movie.profile_path}`
                        : "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"
                )
                .setThumbnail("https://i.imgur.com/44ueTES.png")
                .setFooter({
                    text: `Requested by ${m.user.tag}`,
                    iconURL: m.user.avatarURL()
                        ? m.user.avatarURL()?.toString()
                        : m.user.displayAvatarURL.toString()
                });

            if (vi.video) {
                trendingMovie.setAuthor({
                    name: "Watch trailer",
                    url: vi.video,
                    iconURL: "https://i.imgur.com/OzUuy8B.png"
                });
            }

            m.reply({
                embeds: [trendingMovie]
            });

            collector.on("end", () => {
                interaction.editReply({
                    embeds: [embed],
                    components: []
                });
                return;
            });
        });
    }
}

export default new Trending();
