export interface KnownForResults {
    adult: boolean;
    backdrop_path: string;
    id: number;
    title: string;
    original_language: string;
    original_title: string;
    overview: string;
    poster_path: string;
    media_type: string;
    genre_ids: number[];
    popularity: number;
    release_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

export interface TrendingResults {
    poster_path: string | null;
    adult: boolean;
    overview: string;
    release_data: string;
    genre_ids: number[];
    id: number;
    original_title?: string;
    orignial_name?: string;
    original_language: string;
    title?: string;
    name?: string;
    backdrop_path: string | null;
    first_air_date?: string;
    popularity: number;
    vote_count: number;
    video: boolean;
    vote_average: number;
    origin_country: string[];
    media_type?: string;
    gender?: number;
    known_for_department?: string;
    profile_path?: string;
    known_for?: KnownForResults[];
}

export interface Trending {
    page?: number;
    results?: TrendingResults[];
    total_pages?: number;
    total_results?: number;
}
