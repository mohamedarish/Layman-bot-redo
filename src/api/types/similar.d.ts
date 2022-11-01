export interface SimilarResults {
    adult: boolean;
    backdrop_path: string | null;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title?: string;
    overview: string;
    popularity: number;
    poster_path: string | null;
    release_date?: string;
    title?: string;
    video?: boolean;
    vote_average: number;
    vote_count: number;
    origin_country?: string[];
    original_name?: string;
    first_air_date?: string;
    name?: string;
}

export interface Similar {
    page: number;
    results: SimilarResults[];
    total_pages: number;
    total_results: number;
}