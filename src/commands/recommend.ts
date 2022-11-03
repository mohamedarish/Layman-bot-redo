import {
    ActionRowBuilder,
    CacheType,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    SelectMenuBuilder,
    SelectMenuOptionBuilder,
    SlashCommandBuilder
} from "discord.js";
import { getMovieData, getSimilar } from "../api";
import { BotCommand } from "../structures";

class Recommend extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("recommend")
                .setDescription(
                    "Get movie recommendations based on a movie which you like(tmbd id of the current movie)"
                )
                .addIntegerOption((option) =>
                    option
                        .setName("tmdb_id")
                        .setDescription("The tmdb id of movie")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("type")
                        .setDescription("Movie or series")
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
        const movieID = interaction.options.getInteger("tmdb_id");
        const type = interaction.options.getString("type");

        if (!movieID || !type) return;

        const recommended = await getSimilar(type, movieID);

        if (!recommended) return;

        const recommedMovies = recommended.results.slice(0, 10);

        const vit = await getMovieData(type, recommedMovies[0].id);

        if (!vit) return;

        let recommendEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(
                type == "movie" &&
                    recommedMovies[0].title &&
                    recommedMovies[0].release_date
                    ? `${recommedMovies[0].title}\t⭐️${
                          recommedMovies[0].vote_average
                      } (${recommedMovies[0].release_date.substring(0, 4)})`
                    : type == "tv" &&
                      recommedMovies[0].name &&
                      recommedMovies[0].first_air_date
                    ? `${recommedMovies[0].name}\t⭐️${
                          recommedMovies[0].vote_average
                      } (${recommedMovies[0].first_air_date.substring(0, 4)})`
                    : "No title found"
            )
            .setURL(vit.imdb)
            .setDescription(
                recommedMovies[0].overview
                    ? recommedMovies[0].overview
                    : "No valid description found"
            )
            .setImage(
                recommedMovies[0].poster_path
                    ? `https://image.tmdb.org/t/p/w500${recommedMovies[0].poster_path}`
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
            recommendEmbed.setAuthor({
                name: "Watch trailer",
                url: vit.video,
                iconURL: "https://i.imgur.com/OzUuy8B.png"
            });
        }

        const selectMenu = new SelectMenuBuilder()
            .setCustomId("recommendSelect")
            .setPlaceholder(
                recommedMovies[0].title
                    ? recommedMovies[0].title
                    : recommedMovies[0].name
                    ? recommedMovies[0].name
                    : "No valid title or name found"
            );

        for (let i = 0; i < recommedMovies.length; i += 1) {
            const movie = recommedMovies[i];

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
                        movie.release_date
                            ? movie.release_date
                            : movie.first_air_date
                            ? movie.first_air_date
                            : "No release date found"
                    )
                    .setValue(i.toString())
            );
        }

        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
            selectMenu
        );

        const recommendReply = await interaction.reply({
            embeds: [recommendEmbed],
            ephemeral: true,
            components: [row]
        });

        const collector = recommendReply.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 40000
        });

        collector.on("collect", async (m) => {
            if (m.customId !== "recommendSelect") return;

            if (!m.values) return;

            const sel = parseInt(m.values[0]);

            const movie = recommedMovies[sel];

            const vi = await getMovieData(type, movie.id);

            if (!vi) return;

            recommendEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(
                    type == "movie" && movie.title && movie.release_date
                        ? `${movie.title}\t⭐️${
                              movie.vote_average
                          } (${movie.release_date.substring(0, 4)})`
                        : type == "tv" && movie.name && movie.first_air_date
                        ? `${movie.name}\t⭐️${
                              movie.vote_average
                          } (${movie.first_air_date.substring(0, 4)})`
                        : "No title found"
                )
                .setURL(vi.imdb)
                .setDescription(
                    movie.overview
                        ? movie.overview
                        : "No valid description found"
                )
                .setImage(
                    movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
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
                recommendEmbed.setAuthor({
                    name: "Watch trailer",
                    url: vi.video,
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
                embeds: [recommendEmbed]
            });
            await m.deferReply();

            m.deleteReply();
        });

        collector.on("end", () => {
            interaction.editReply({
                embeds: [recommendEmbed],
                components: []
            });
            return;
        });
    }
}

export default new Recommend();
