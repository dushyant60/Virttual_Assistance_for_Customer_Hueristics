import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const initialState = {
  accountInfo: null,
  // Other initial state properties
};

// Retrieve persisted account info from local storage
const persistedAccountInfo = JSON.parse(localStorage.getItem('accountInfo'));

// If persisted account info is available, use it as initial state
if (persistedAccountInfo) {
  initialState.accountInfo = persistedAccountInfo;
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_ACCOUNT_INFO':
      return { ...state, accountInfo: action.payload };
    case 'CLEAR_ACCOUNT_INFO': // New case to clear account info
      return { ...state, accountInfo: null };
    // Handle other actions
    default:
      return state;
  }
}

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducer);

const store = createStore(persistedReducer);

export const persistor = persistStore(store);

export default store;
