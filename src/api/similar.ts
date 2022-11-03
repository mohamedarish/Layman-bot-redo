import { APIError } from "./types/error";
import { Similar } from "./types/similar";
import fetch from "cross-fetch";

async function getSimilar(type: string, id: number): Promise<Similar | void> {
    const res = (await (
        await fetch(
            `https://api.themoviedb.org/3/${type}/${id}/similar?api_key=${process.env.TMDB}&language=en-US&page=1`
        )
    ).json()) as Similar | APIError;

    let validResponse;

    if ("status_code" in res) {
        return;
    } else {
        validResponse = res as Similar;
    }

    return validResponse;
}

export default getSimilar;
