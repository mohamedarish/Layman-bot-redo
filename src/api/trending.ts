import { APIError } from "./types/error";
import { Trending } from "./types/trending";

const trending = async (t: string, frame: string): Promise<void | Trending> => {
    const response = (await (
        await fetch(
            `https://api.themoviedb.org/3/trending/${t}/${frame}?api_key=${process.env.TMDB}`
        )
    ).json()) as Trending | APIError;

    let validResponse;

    if ("status_code" in response) {
        return;
    } else {
        validResponse = response as Trending;
    }

    return validResponse;
};

export default trending;
