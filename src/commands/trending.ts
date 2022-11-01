import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder
} from "@discordjs/builders";
import {
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    ComponentType,
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

        const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

        actionRows.push(new ActionRowBuilder<ButtonBuilder>());
        actionRows.push(new ActionRowBuilder<ButtonBuilder>());

        const emotes = [
            "1️⃣",
            "2️⃣",
            "3️⃣",
            "4️⃣",
            "5️⃣",
            "6️⃣",
            "7️⃣",
            "8️⃣",
            "9️⃣",
            "🔟"
        ];

        trendingMovies.forEach((movie) => {
            if (trendingMovies.indexOf(movie) < 5) {
                actionRows[0].addComponents(
                    new ButtonBuilder()
                        .setCustomId(trendingMovies.indexOf(movie).toString())
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji({
                            name: emotes[trendingMovies.indexOf(movie)]
                        })
                );
            } else {
                actionRows[1].addComponents(
                    new ButtonBuilder()
                        .setCustomId(trendingMovies.indexOf(movie).toString())
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji({
                            name: emotes[trendingMovies.indexOf(movie)]
                        })
                );
            }

            embed.addFields({
                name: movie.title
                    ? `${trendingMovies.indexOf(movie) + 1}. ${movie.title}`
                    : movie.name
                    ? `${trendingMovies.indexOf(movie) + 1}. ${movie.name}`
                    : "No title found",
                value: movie.first_air_date
                    ? movie.first_air_date.substring(0, 4)
                    : movie.release_date
                    ? movie.release_date.substring(0, 4)
                    : movie.known_for_department
                    ? movie.known_for_department
                    : "No valid data found"
            });
        });

        const buttons: ButtonBuilder[] = [];

        for (let i = 0; i < 10; i += 1) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId(i.toString())
                    .setEmoji({ name: emotes[i] })
            );
        }

        const TrendingReply = await interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components: [actionRows[0], actionRows[1]]
        });

        const collector = TrendingReply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000
        });

        collector.on("collect", (m) => {
            const selection = parseInt(m.customId);

            const movie = trendingMovies[selection];

            const trendingMovie = new EmbedBuilder()
                .setColor(0xff5544)
                .setTitle(
                    movie.title
                        ? movie.title
                        : movie.name
                        ? movie.name
                        : "No title or name found"
                )
                .setURL(`https://www.themoviedb.org/${type}/${movie.id}`)
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
                    text: `Requested bu ${m.user.tag}`,
                    iconURL: m.user.avatarURL()
                        ? m.user.avatarURL()?.toString()
                        : m.user.displayAvatarURL.toString()
                });

            m.reply({
                embeds: [trendingMovie],
                ephemeral: true
            });

            collector.on("end", () => {
                interaction.editReply({
                    embeds: [embed],
                    components: []
                });
            });
        });
    }
}

export default new Trending();
