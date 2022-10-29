import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
} from "@discordjs/builders";
import {
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
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
            totalResults: res.total_results,
        };

        if (!movieResults) return;

        // interaction.reply({
        //     content: `Found ${movieResults.results?.length} results out of a total possible ${movieResults.total_results}`,
        //     ephemeral: true,
        // });

        if (
            !movieResults.results ||
            !movieResults.page ||
            !movieResults.totalPages ||
            !movieResults.totalResults
        )
            return;

        const embed = new EmbedBuilder()
            .setTitle(`Search results for ${query}`)
            .setColor(0x00ff0f);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("back")
                .setStyle(ButtonStyle.Primary)
                .setEmoji({ name: "⬅️" })
        );

        const emotes = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

        for (
            let i = 0;
            i < (movieResults.totalResults < 8 ? movieResults.totalResults : 8);
            i += 1
        ) {
            const movie = movieResults.results[i];

            embed.addFields({
                name: `${movie.title} (${movie.release_date.substring(0, 4)})`,
                value: `${movie.vote_average * 10} %`,
            });

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(i.toString())
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji({ name: emotes[i] })
            );
        }

        row.addComponents(
            new ButtonBuilder()
                .setCustomId("forward")
                .setStyle(ButtonStyle.Primary)
                .setEmoji({ name: "➡️" })
        );

        interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
        });
    }
}

export default new Search();
