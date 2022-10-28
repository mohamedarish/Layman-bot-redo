import { APIError } from "./types/error";
import { Search } from "./types/search";

async function getRequiredResponse(
    q: string,
    page: number
): Promise<Search | void> {
    const response = (await (
        await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB}&language=en-US&query=${q}&page=${page}&include_adult=false`
        )
    ).json()) as Search | APIError;

    let validResponse;

    if ("status_code" in response) {
        return;
    } else {
        validResponse = response as Search;
    }

    if (
        !validResponse.page ||
        !validResponse.results ||
        !validResponse.total_pages ||
        !validResponse.total_results
    )
        return;

    return validResponse;
}

const search = async (query: string): Promise<void | Search> => {
    const response = await getRequiredResponse(query, 1);

    if (
        !response ||
        !response.page ||
        !response.results ||
        !response.total_pages ||
        !response.total_results
    )
        return;

    for (let i = 2; i <= response.total_pages; i += 1) {
        const response2 = await getRequiredResponse(query, i);

        if (
            !response2 ||
            !response2.page ||
            !response2.results ||
            !response2.total_pages ||
            !response2.total_results
        )
            return response;

        response.results = [...response.results, ...response2.results];
    }

    return response;
};

export default search;
