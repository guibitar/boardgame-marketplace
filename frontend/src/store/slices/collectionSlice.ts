import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { Game, GameCreate, GameUpdate, UserCollection } from '../../types/game';

interface CollectionState {
  collection: UserCollection | null;
  loading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
  collection: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCollection = createAsyncThunk(
  'collection/fetch',
  async (params?: { sortBy?: string; sortOrder?: string }) => {
    console.log('Redux: Fetching collection with params:', params);
    const response = await api.get<UserCollection>('/api/collection', { params });
    console.log('Redux: Collection fetched, total games:', response.data.total_games);
    return response.data;
  }
);

export const addGame = createAsyncThunk(
  'collection/addGame',
  async (data: GameCreate) => {
    const response = await api.post<Game>('/api/collection/games', data);
    return response.data;
  }
);

export const updateGame = createAsyncThunk(
  'collection/updateGame',
  async ({ id, data }: { id: number; data: GameUpdate }) => {
    const response = await api.put<Game>(`/api/collection/games/${id}`, data);
    return response.data;
  }
);

export const removeGame = createAsyncThunk(
  'collection/removeGame',
  async (id: number) => {
    await api.delete(`/api/collection/games/${id}`);
    return id;
  }
);

export const clearCollection = createAsyncThunk(
  'collection/clearCollection',
  async () => {
    const response = await api.delete('/api/collection');
    return response.data;
  }
);

export const importFromLudopedia = createAsyncThunk(
  'collection/importLudopedia',
  async (ludopediaIds: number[]) => {
    const response = await api.post<Game[]>('/api/collection/import/ludopedia', ludopediaIds);
    return response.data;
  }
);

export const importFromBGG = createAsyncThunk(
  'collection/importBGG',
  async (bggIds: number[]) => {
    const response = await api.post<Game[]>('/api/collection/import/bgg', bggIds);
    return response.data;
  }
);

// Slice
const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch collection
    builder
      .addCase(fetchCollection.pending, (state) => {
        console.log('Redux: fetchCollection.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollection.fulfilled, (state, action) => {
        console.log('Redux: fetchCollection.fulfilled, games:', action.payload.games?.length);
        state.loading = false;
        state.collection = action.payload;
      })
      .addCase(fetchCollection.rejected, (state, action) => {
        console.log('Redux: fetchCollection.rejected', action.error);
        state.loading = false;
        state.error = action.error.message || 'Erro ao carregar coleção';
      });

    // Add game
    builder
      .addCase(addGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGame.fulfilled, (state, action) => {
        state.loading = false;
        if (state.collection) {
          state.collection.games.push(action.payload);
          state.collection.total_games = state.collection.games.length;
        }
      })
      .addCase(addGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao adicionar jogo';
      });

    // Update game
    builder
      .addCase(updateGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGame.fulfilled, (state, action) => {
        state.loading = false;
        if (state.collection) {
          const index = state.collection.games.findIndex(g => g.id === action.payload.id);
          if (index !== -1) {
            state.collection.games[index] = action.payload;
          }
        }
      })
      .addCase(updateGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao atualizar jogo';
      });

    // Remove game
    builder
      .addCase(removeGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeGame.fulfilled, (state, action) => {
        state.loading = false;
        if (state.collection) {
          state.collection.games = state.collection.games.filter(g => g.id !== action.payload);
          state.collection.total_games = state.collection.games.length;
        }
      })
      .addCase(removeGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao remover jogo';
      });

    // Clear collection
    builder
      .addCase(clearCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCollection.fulfilled, (state) => {
        state.loading = false;
        state.collection = {
          user_id: state.collection?.user_id || 0,
          total_games: 0,
          games: []
        };
      })
      .addCase(clearCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao limpar coleção';
      });

    // Import from Ludopedia
    builder
      .addCase(importFromLudopedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importFromLudopedia.fulfilled, (state, action) => {
        state.loading = false;
        if (state.collection) {
          state.collection.games.push(...action.payload);
          state.collection.total_games = state.collection.games.length;
        }
      })
      .addCase(importFromLudopedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao importar da Ludopedia';
      });

    // Import from BGG
    builder
      .addCase(importFromBGG.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importFromBGG.fulfilled, (state, action) => {
        state.loading = false;
        if (state.collection) {
          state.collection.games.push(...action.payload);
          state.collection.total_games = state.collection.games.length;
        }
      })
      .addCase(importFromBGG.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao importar do BoardGameGeek';
      });
  },
});

export const { clearError } = collectionSlice.actions;
export default collectionSlice.reducer;

