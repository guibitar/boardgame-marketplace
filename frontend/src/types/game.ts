export type GameType = 'BASE' | 'EXPANSION';

export interface Game {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  year_published?: number;
  game_type: GameType;
  base_game_id?: number;
  base_game_name?: string;
  
  // Dados de importação
  ludopedia_id?: number;
  bgg_id?: number;
  order?: number;
  
  // Metadados
  min_players?: number;
  max_players?: number;
  min_playtime?: number;
  max_playtime?: number;
  min_age?: number;
  rating?: number;
  weight?: number;
  ranking_position?: number;
  
  // Estado do jogo
  is_for_trade: boolean;
  is_for_sale: boolean;
  condition?: string;
  price?: number;
  purchase_price?: number;
  notes?: string;
  
  // Imagem
  image_url?: string;
  
  // Timestamps
  created_at: string;
  updated_at?: string;
}

export interface GameCreate {
  name: string;
  description?: string;
  year_published?: number;
  game_type?: GameType;
  base_game_id?: number;
  ludopedia_id?: number;
  bgg_id?: number;
  min_players?: number;
  max_players?: number;
  min_playtime?: number;
  max_playtime?: number;
  min_age?: number;
  rating?: number;
  weight?: number;
  ranking_position?: number;
  is_for_trade?: boolean;
  is_for_sale?: boolean;
  condition?: string;
  price?: number;
  purchase_price?: number;
  notes?: string;
  image_url?: string;
}

export interface GameUpdate {
  name?: string;
  description?: string;
  year_published?: number;
  game_type?: GameType;
  base_game_id?: number;
  min_players?: number;
  max_players?: number;
  min_playtime?: number;
  max_playtime?: number;
  min_age?: number;
  rating?: number;
  weight?: number;
  ranking_position?: number;
  is_for_trade?: boolean;
  is_for_sale?: boolean;
  condition?: string;
  price?: number;
  purchase_price?: number;
  notes?: string;
  image_url?: string;
}

export interface UserCollection {
  user_id: number;
  total_games: number;
  games: Game[];
}

