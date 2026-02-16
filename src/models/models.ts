export interface Cart {
  cart?: string[];
}

export interface Member {
  username: string;
  first_name: string;
  last_name: string;
  cart?: string[];
  checked_out?: string[];
  rented?: string[];
  member_type: string;
  api_choice?: string;
}

export interface Movie {
  id: string;
  title: string;
  cast?: string[];
  director?: string;
  inventory?: number;
  rented?: number;
  rating?: string;
  review?: string;
  synopsis?: string;
  mets?: MovieMetrics;
  trivia?: string;
  year?: string;
  centroid?: number;
  paginate_key?: string;
}

export interface MovieTrivia {
  trivia: string;
}

export interface MovieMetrics {
  acting: number;
  action: number;
  cinematography: number;
  comedy: number;
  directing: number;
  drama: number;
  fantasy: number;
  horror: number;
  romance: number;
  story_telling: number;
  suspense: number;
  writing: number;
}
