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
import { getMovieData, search } from "../api";
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
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("movie or series")
                        .addChoices(
                            { name: "movie", value: "movie" },
                            { name: "series", value: "tv" }
                        )
                        .setRequired(true)
                )
                .toJSON()
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const query = interaction.options.getString("query");
        const type = interaction.options.getString("type");

        if (!query || !type) return;

        const res = await search(type, query);

        if (!res) return;

        if (
            !res.results ||
            !res.page ||
            !res.total_pages ||
            !res.total_results
        ) {
            interaction.editReply({
                content: `No results found for ${query}`
            });
            return;
        }

        const movieResults = res.results;

        if (movieResults.length < 1) {
            interaction.editReply({
                content: `No results found for ${query}`
            });
            return;
        }

        // movieResults.sort((a, b) => (a.vote_average > b.vote_average ? 1 : -1)); // This is for sorting based on popularity not implemented because this gives bogus unwanted results first priority

        while (movieResults.length > 10) {
            movieResults.pop();
        }

        const vit = await getMovieData(
            movieResults[0].media_type ? movieResults[0].media_type : type,
            movieResults[0].id
        );

        if (!vit) return;

        let searchEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(
                movieResults[0].title
                    ? `${movieResults[0].title} ⭐️${movieResults[0].vote_average}`
                    : movieResults[0].name
                    ? movieResults[0].vote_average
                        ? `${movieResults[0].name} ⭐️${movieResults[0].vote_average}`
                        : movieResults[0].popularity
                        ? `${movieResults[0].name} 🌟${movieResults[0].popularity}`
                        : movieResults[0].name
                    : "No title or name found"
            )
            .setURL(vit.imdb)
            .setDescription(
                movieResults[0].overview
                    ? `id: ${movieResults[0].id}\n${movieResults[0].overview}`
                    : movieResults[0].known_for_department
                    ? `id: ${movieResults[0].id}\n${movieResults[0].known_for_department}`
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
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL()
                    ? interaction.user.avatarURL()?.toString()
                    : interaction.user.displayAvatarURL.toString()
            });

        if (vit.video) {
            searchEmbed.setAuthor({
                name: "Watch trailer",
                url: vit.video ? vit.video : undefined,
                iconURL: "https://i.imgur.com/OzUuy8B.png"
            });
        }

        const selectMenu = new SelectMenuBuilder()
            .setCustomId("searchSelect")
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
                    .setDescription(movie.id.toString())
                    .setValue(i.toString())
            );
        }

        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
            selectMenu
        );

        const searchReply = await interaction.editReply({
            embeds: [searchEmbed],
            components: [row]
        });

        const collector = searchReply.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 40000
        });

        collector.on("collect", async (m) => {
            if (m.customId !== "searchSelect") return;

            if (!m.values) return;

            const sel = parseInt(m.values[0]);

            const movie = movieResults[sel];

            const vi = await getMovieData(
                movie.media_type ? movie.media_type : type,
                movie.id
            );

            if (!vi) return;

            searchEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(
                    movie.title
                        ? `${movie.title} ⭐️${movie.vote_average}`
                        : movie.name
                        ? movie.vote_average
                            ? `${movie.name} ⭐️${movie.vote_average}`
                            : movie.popularity
                            ? `${movie.name} 🌟${movie.popularity}`
                            : movie.name
                        : "No title or name found"
                )
                .setURL(vi.imdb)
                .setDescription(
                    movie.overview
                        ? `id: ${movie.id}\n${movie.overview}`
                        : movie.known_for_department
                        ? `id: ${movie.id}\n${movie.known_for_department}`
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
                searchEmbed.setAuthor({
                    name: "Watch trailer",
                    url: vi.video ? vi.video : undefined,
                    iconURL: "https://i.imgur.com/OzUuy8B.png"
                });
            }

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
                embeds: [searchEmbed]
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
                embeds: [searchEmbed],
                components: []
            });
            return;
        });
    }
}

export default new Search();
