export interface TrendingResults {
    poster_path?: string | null;
    adult?: boolean;
    overview?: string;
    release_data?: string;
    genre_ids?: number[];
    id?: number;
    original_title?: string;
    original_language?: string;
    title?: string;
    backdrop_path?: string | null;
    popularity?: number;
    vote_count?: number;
    video?: boolean;
    vote_average?: number;
}

export interface Trending {
    page?: number;
    results?: TrendingResults[];
    total_pages?: number;
    total_results?: number;
}
