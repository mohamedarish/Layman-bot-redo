import { search } from "../src/api";

it("Should check if tmdb returns values properly using the api key for the search command for movies", async () => {
    const movieSearch = await search("movie", "forrest gump");

    expect(movieSearch).not.toBeNull;

    if (!movieSearch || !movieSearch.results) return;

    expect(movieSearch.results[0].id).toBe(13);
});

it("Should check if tmdb returns values properly using the api key for the search command for series", async () => {
    const seriesSearch = await search("series", "house");

    expect(seriesSearch).not.toBeNull;

    if (!seriesSearch || !seriesSearch.results) return;

    expect(seriesSearch.results[0].id).toBe(1048);
});
