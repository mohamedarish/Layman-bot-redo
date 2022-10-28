export interface SearchResults {
    id?: number;
    logo_path?: string | null;
    name?: string;
}

export interface Search {
    page?: number;
    results?: SearchResults[];
    total_pages?: number;
    total_results?: number;
}
