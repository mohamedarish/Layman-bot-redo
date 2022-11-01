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

        if (!res.results || !res.page || !res.total_pages || !res.total_results)
            return;

        const movieResults = res.results;

        while (movieResults.length > 10) {
            movieResults.pop();
        }

        let trendingEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(
                movieResults[0].title
                    ? movieResults[0].title
                    : movieResults[0].name
                    ? movieResults[0].name
                    : "No title or name found"
            )
            .setURL(`https://www.themoviedb.org/movie/${movieResults[0].id}`)
            .setDescription(
                movieResults[0].overview
                    ? movieResults[0].overview
                    : movieResults[0].known_for_department
                    ? movieResults[0].known_for_department
                    : "No valid description found"
            )
            .setImage(
                movieResults[0].poster_path
                    ? `https://image.tmdb.org/t/p/w500${movieResults[0].poster_path}`
                    : movieResults[0].profile_path
                    ? `https://image.tmdb.org/t/p/w500${movieResults[0].profile_path}`
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
                movieResults[0].title
                    ? movieResults[0].title
                    : movieResults[0].name
                    ? movieResults[0].name
                    : "No valid title or name found"
            );

        for (let i = 0; i < movieResults.length; i += 1) {
            const movie = movieResults[i];

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

            const movie = movieResults[sel];

            trendingEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(
                    movie.title
                        ? movie.title
                        : movie.name
                        ? movie.name
                        : "No title or name found"
                )
                .setURL(`https://www.themoviedb.org/movie/${movie.id}`)
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

export default new Search();
