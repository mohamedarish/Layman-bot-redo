import { KnownForResults } from "./trending";

export interface SearchResults {
    poster_path?: string | null;
    adult: boolean;
    overview?: string;
    release_date?: string;
    genre_ids?: number[];
    id: number;
    original_title: string;
    original_language: string;
    title?: string;
    backdrop_path?: string | null;
    popularity: number;
    vote_count: number;
    video?: boolean;
    vote_average: number;
    name?: string;
    first_air_date?: string;
    origin_country: string[];
    media_type?: string;
    gender?: number;
    known_for_department?: string;
    profile_path?: string;
    known_for?: KnownForResults[];
}

export interface Search {
    page?: number;
    results?: SearchResults[];
    total_pages?: number;
    total_results?: number;
}
