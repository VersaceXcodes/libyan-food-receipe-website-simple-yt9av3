import { configureStore, createSlice, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { io } from "socket.io-client";
import axios from "axios";

// Define initial global state using snake_case naming
const initial_global_state = {
  auth_state: {
    is_authenticated: false,
    token: "",
    user_info: null,
  },
  site_settings: {
    site_title: "Libyan Food Recipes",
    tagline: "Explore the rich culinary traditions of Libya",
  },
  notification_state: {
    error: null,
    success: null,
  },
  global_search_query: "",
};

// Create global slice to manage all global state variables and actions
const global_slice = createSlice({
  name: "global",
  initialState: initial_global_state,
  reducers: {
    set_auth_state: (state, action) => {
      state.auth_state = action.payload;
    },
    clear_auth_state: (state) => {
      state.auth_state = { is_authenticated: false, token: "", user_info: null };
    },
    set_site_settings: (state, action) => {
      state.site_settings = action.payload;
    },
    set_notification: (state, action) => {
      // Update notification_state (e.g., { error: "error message" } or { success: "success message" })
      state.notification_state = { ...state.notification_state, ...action.payload };
    },
    clear_notification: (state) => {
      state.notification_state = { error: null, success: null };
    },
    set_global_search_query: (state, action) => {
      state.global_search_query = action.payload;
    },
  },
});

// Export the actions for usage in view components
export const {
  set_auth_state,
  clear_auth_state,
  set_site_settings,
  set_notification,
  clear_notification,
  set_global_search_query,
} = global_slice.actions;

// Combine reducers
const root_reducer = combineReducers({
  global: global_slice.reducer,
});

// Configure redux-persist to use localStorage so that state is not lost on refresh
const persist_config = {
  key: "root",
  storage,
  whitelist: ["global"],
};

const persisted_reducer = persistReducer(persist_config, root_reducer);

// Create store with middleware configuration, disabling serializableChecks for redux-persist actions
const store = configureStore({
  reducer: persisted_reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Persistor for persisting store state to localStorage
export const persistor = persistStore(store);

// Initialize socket.io-client for real-time events if VITE_SOCKET_URL is provided
const socket_url = import.meta.env.VITE_SOCKET_URL || "";
let socket = null;

if (socket_url) {
  socket = io(socket_url);

  socket.on("connect", () => {
    console.log("Socket connected with id:", socket.id);
  });

  // Listen for "notification" events and update global notification_state
  socket.on("notification", async (data) => {
    try {
      // In case asynchronous processing is needed, using async/await
      await Promise.resolve();
      store.dispatch(set_notification({ success: data.message }));
    } catch (error) {
      console.error("Error handling socket notification:", error);
    }
  });
}

export { socket };

// Export store as default so it can be imported later with:
// import store from '@/store/main'
export default store;