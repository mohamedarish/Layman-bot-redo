import { APIError } from "./types/error";
import { Search } from "./types/search";
import fetch from "cross-fetch";

const search = async (type: string, query: string): Promise<void | Search> => {
    const response = (await (
        await fetch(
            `https://api.themoviedb.org/3/search/${type}?api_key=${process.env.TMDB}&language=en-US&query=${query}&page=1&include_adult=false`
        )
    ).json()) as Search | APIError;

    let validResponse;

    if ("status_code" in response) {
        return;
    } else {
        validResponse = response as Search;
    }

    return validResponse;
};

export default search;
