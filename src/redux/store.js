import {configureStore} from "@reduxjs/toolkit";
import productSlice from "./productSlice"; 
import cartSlice from "./cartSlice";
import userSlice from "./userSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "cart",  
  storage,      
};
const persistedCartReducer = persistReducer(persistConfig, cartSlice);

const store = configureStore({
  reducer: {
    cart: persistedCartReducer,
    user: userSlice,
    products: productSlice,
  },
});
export const persistor = persistStore(store);
export default store;