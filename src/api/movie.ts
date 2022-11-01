import { MovieData } from "./types/movie";
import { APIError } from "./types/error";
import { VideoData } from "./types/video";
import { IMDBnYT } from "./types/ret";

async function getMovieData(type: string, id: number): Promise<IMDBnYT | void> {
    const res = (await (
        await fetch(
            `https://api.themoviedb.org/3/${type}/${id}/external_ids?api_key=${process.env.TMDB}&language=en-US`
        )
    ).json()) as MovieData | APIError;

    const vres = (await (
        await fetch(
            `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${process.env.TMDB}&language=en-US`
        )
    ).json()) as VideoData;

    let validResponse;
    let vvalidResponse;

    if ("status_code" in res || "status_code" in vres) {
        return;
    } else {
        validResponse = res as MovieData;
        vvalidResponse = vres as VideoData;
    }

    const imdbLink = `https://www.imdb.com/title/${validResponse.imdb_id}`;

    let videoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

    for (let i = 0; i < vvalidResponse.results.length; i += 1) {
        const videoResult = vvalidResponse.results[i];

        if (videoResult.site === "YouTube" && videoResult.type === "Trailer") {
            videoLink = `https://www.${videoResult.site}.com/watch?v=${videoResult.key}`;
            break;
        }
    }

    const ret: IMDBnYT = {
        video: videoLink,
        imdb: imdbLink
    };

    return ret;
}

export default getMovieData;
