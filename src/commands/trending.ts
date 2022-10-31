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
    SelectMenuInteraction,
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

        let trendingEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(
                trendingMovies[0].title
                    ? trendingMovies[0].title
                    : trendingMovies[0].name
                    ? trendingMovies[0].name
                    : "No title or name found"
            )
            .setURL(
                `https://www.themoviedb.org/${type}/${trendingMovies[0].id}`
            )
            .setDescription(
                trendingMovies[0].overview
                    ? trendingMovies[0].overview
                    : trendingMovies[0].known_for_department
                    ? trendingMovies[0].known_for_department
                    : "No valid description found"
            )
            .setImage(
                trendingMovies[0].poster_path
                    ? `https://image.tmdb.org/t/p/w500${trendingMovies[0].poster_path}`
                    : trendingMovies[0].profile_path
                    ? `https://image.tmdb.org/t/p/w500${trendingMovies[0].profile_path}`
                    : "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"
            )
            .setThumbnail("https://i.imgur.com/44ueTES.png")
            .setFooter({
                text: `Requested bu ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL()
                    ? interaction.user.avatarURL()?.toString()
                    : interaction.user.displayAvatarURL.toString()
            });

        const selectMenu = new SelectMenuBuilder()
            .setCustomId("trendingSelect")
            .setPlaceholder(
                trendingMovies[0].title
                    ? trendingMovies[0].title
                    : trendingMovies[0].name
                    ? trendingMovies[0].name
                    : "No valid title or name found"
            );

        for (let i = 0; i < trendingMovies.length; i += 1) {
            const movie = trendingMovies[i];

            selectMenu.addOptions(
                new SelectMenuOptionBuilder()
                    .setLabel(
                        movie.title
                            ? movie.title
                            : movie.name
                            ? movie.name
                            : "No valid title or name found"
                    )
                    .setDescription(
                        movie.first_air_date
                            ? movie.first_air_date.substring(0, 4)
                            : movie.release_date
                            ? movie.release_date.substring(0, 4)
                            : movie.known_for_department
                            ? movie.known_for_department
                            : "no valid info found"
                    )
                    .setValue(i.toString())
            );
        }

        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
            selectMenu
        );

        const trendingReply = await interaction.reply({
            embeds: [trendingEmbed],
            ephemeral: true,
            components: [row]
        });

        const collector = trendingReply.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 30000
        });

        collector.on("collect", (m) => {
            if (m.customId !== "trendingSelect") return;

            if (!m.values || !m.values[0]) return;

            const sel = parseInt(m.values[0]);

            const movie = trendingMovies[sel];

            trendingEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
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

            selectMenu.setPlaceholder(
                movie.title
                    ? movie.title
                    : movie.name
                    ? movie.name
                    : "No valid title or name found"
            );

            const newRow =
                new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                    selectMenu
                );

            interaction.editReply({
                components: [newRow],
                embeds: [trendingEmbed]
            });
            m.reply({
                content: `Succesfully changed option to ${
                    movie.title
                        ? movie.title
                        : movie.name
                        ? movie.name
                        : "No title found"
                }`,
                ephemeral: true
            });
        });

        collector.on("end", () => {
            interaction.editReply({
                embeds: [trendingEmbed],
                components: []
            });
            return;
        });
    }
}

export default new Trending();
