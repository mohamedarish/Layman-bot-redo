import { getMovieData } from "../src/api";

it("Just testing if the api key is able to succesfully get data of movie", async () => {
    const movieData = await getMovieData("movie", 550); // This is fight club

    expect(movieData).not.toBe(null);

    if (!movieData) return;

    expect(movieData.imdb).toEqual("https://www.imdb.com/title/tt0137523");

    expect(movieData).toEqual("https://www.youtube.com/watch?v=BdJKm16Co6M");
});
