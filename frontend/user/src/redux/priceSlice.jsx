
import { createSlice } from "@reduxjs/toolkit";

const initialState ={
    price:null,
};

const priceSlice = createSlice({
    name:"price",
    initialState,
    reducers:{
        offerPrice:(state,action)=>{
            state.price = action.payload;
        }
    }
});

export const {offerPrice} = priceSlice.actions;
export default priceSlice.reducer;