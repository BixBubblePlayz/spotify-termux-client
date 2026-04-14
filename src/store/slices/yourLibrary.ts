import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Services
import { userService } from '../../services/users';
import { albumsService } from '../../services/albums';
import { playlistService } from '../../services/playlists';

// Interfaces
import type { RootState } from '../store';
import type { Album } from '../../interfaces/albums';
import type { Artist } from '../../interfaces/artist';
import type { Playlist } from '../../interfaces/playlists';
import { LIKED_SONGS_IMAGE } from '../../constants/spotify';

export interface YourLibraryState {
  myAlbums: Album[];
  myArtists: Artist[];
  myPlaylists: Playlist[];

  search: string;
  view: 'GRID' | 'LIST' | 'COMPACT';
  orderBy: 'name' | 'added_at' | 'default';
  filter: 'ALL' | 'ALBUMS' | 'ARTISTS' | 'PLAYLISTS';
}

const initialState: YourLibraryState = {
  search: '',
  myAlbums: [],
  view: 'LIST',
  filter: 'ALL',
  myArtists: [],
  myPlaylists: [],
  orderBy: 'default',
};

export const fetchMyPlaylists = createAsyncThunk('yourLibrary/fetchMyPlaylists', async () => {
  const response = await playlistService.getMyPlaylists({ limit: 50 });
  return response.data.items;
});

export const fetchMyAlbums = createAsyncThunk('yourLibrary/fetchTopTracks', async () => {
  const response = await albumsService.fetchSavedAlbums({ limit: 50 });
  return response.data.items.map((item) => item.album);
});

export const fetchMyArtists = createAsyncThunk('yourLibrary/fetchMyArtists', async () => {
  const response = await userService.fetchFollowedArtists({ limit: 50 });
  return response.data.artists.items;
});

const yourLibrarySlice = createSlice({
  name: 'yourLibrary',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<{ filter: YourLibraryState['filter'] }>) {
      state.filter = action.payload.filter;
    },
    setSearch(state, action: PayloadAction<{ search: string }>) {
      state.search = action.payload.search;
    },
    setView(state, action: PayloadAction<{ view: YourLibraryState['view'] }>) {
      state.view = action.payload.view;
    },
    setOrderBy(state, action: PayloadAction<{ orderBy: YourLibraryState['orderBy'] }>) {
      state.orderBy = action.payload.orderBy;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMyPlaylists.fulfilled, (state, action) => {
      state.myPlaylists = action.payload;
    });
    builder.addCase(fetchMyAlbums.fulfilled, (state, action) => {
      state.myAlbums = action.payload;
    });
    builder.addCase(fetchMyArtists.fulfilled, (state, action) => {
      state.myArtists = action.payload;
    });
  },
});

export const getLibraryItems = createSelector(
  [
    (state: RootState) => state.auth.user,
    (state: RootState) => state.yourLibrary.filter,
    (state: RootState) => state.yourLibrary.myAlbums,
    (state: RootState) => state.yourLibrary.myArtists,
    (state: RootState) => state.yourLibrary.myPlaylists,
  ],
  (user, filter, myAlbums, myArtists, myPlaylists) => {
    const albums = Array.isArray(myAlbums) ? myAlbums : [];
    const artists = Array.isArray(myArtists) ? myArtists : [];
    const playlists = Array.isArray(myPlaylists) ? myPlaylists : [];

    if (filter === 'ALBUMS') return albums;
    if (filter === 'ARTISTS') return artists;
    if (filter === 'PLAYLISTS') return playlists;

    if (!user) return [];
    if (!albums.length && !artists.length && !playlists.length) return [];

    const likedSongs: Playlist = {
      id: 'liked-songs',
      name: 'Liked Songs',
      snapshot_id: '',
      collaborative: false,
      public: false,
      description: '',
      href: '',
      type: 'playlist',
      tracks: { href: '', total: 0 },
      external_urls: { spotify: '' },
      followers: { href: '', total: 0 },
      uri: `spotify:user:${user?.id}:collection`,
      images: [{ url: LIKED_SONGS_IMAGE, width: 300, height: 300 }],
      owner: user!,
    };

    return [
      playlists.slice(0, 3),
      likedSongs,
      albums.slice(0, 2),
      playlists.slice(3, 6),
      artists.slice(0, 1),
      albums.slice(2, 5),
      artists.slice(1, 2),
      playlists.slice(6, 10),
      albums.slice(5, 9),
      artists.slice(2, 6),
      playlists.slice(10, 15),
      albums.slice(9, 13),
      artists.slice(6, 10),
      playlists.slice(15, 20),
      albums.slice(13, 17),
      artists.slice(10, 14),
      playlists.slice(20, 25),
      albums.slice(17, 21),
      artists.slice(14, 18),
      playlists.slice(25, 30),
      albums.slice(21, 25),
      artists.slice(18, 22),
      playlists.slice(30, 35),
      albums.slice(25, 43),
      // all the rest
      playlists.slice(35),
      artists.slice(22),
      albums.slice(43),
    ]
      .filter((r) => r)
      .flat();
  }
);

export const getUserPlaylists = createSelector(
  [(state: RootState) => state.yourLibrary.myPlaylists, (state: RootState) => state.auth.user],
  (playlists, user) => {
    return (playlists || []).filter((playlist) => playlist.owner?.id === user?.id);
  }
);

export const yourLibraryActions = {
  fetchMyAlbums,
  fetchMyArtists,
  fetchMyPlaylists,
  ...yourLibrarySlice.actions,
};

export default yourLibrarySlice.reducer;
