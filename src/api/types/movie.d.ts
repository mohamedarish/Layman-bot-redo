export interface MovieData {
    imdb_id: string;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
    id: number;
    freebase_mid?: string | null;
    freebase_id?: string | null;
    tvdb_id?: number | null;
    tvrage_id?: number | null;
}
