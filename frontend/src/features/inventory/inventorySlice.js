import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

//thunks lets us create the async calling actions and helps us to create fdaeay in the react flask apps
//ai generated redux explanation for reveiwing and explainng
/* ============================================================
   ASYNC THUNKS
   ------------------------------------------------------------
   A thunk is an asynchronous Redux action.
   It is typically used for API calls.

   Every createAsyncThunk automatically creates 3 actions:

   pending    -> API request has started
   fulfilled  -> API request succeeded
   rejected   -> API request failed
============================================================ */

// ============================================================
// GET ALL ITEMS
// ============================================================
export const fetchItems = createAsyncThunk(
  "inventory/fetchItems",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/inventory/");
      return response.data; // becomes action.payload in fulfilled
    } catch (err) {
      // rejectWithValue lets us control exactly what shows up in action.payload on failure
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Failed to fetch items");
    }
  }
);
//addig an item in teh inventory
export const addItem = createAsyncThunk(
  "inventory/addItem",
  async (itemData, thunkAPI) => {
    /*
      itemData is whatever we dispatch.

      Example:

      dispatch(addItem({
          name: "Laptop",
          sku: "LAP123",
          quantity: 5
      }))
    */
   try {const response=await api.post("/inventory/",itemData)
    return response.data;

   }
   catch(err)
   {
    return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to add item"
    );
   }
  }
);

export const updateItem = createAsyncThunk(
  "inventory/updateItem",
  async ({ id, data }, thunkAPI) => {
   try{
    const response=await api.patch(`/inventory/${id}`,data)
    return response.data
   }
   catch(err)
   {
    return thunkAPI.rejectWithValue(
        err.response?.data?.error || "failed to update item"
    )
   }

  }
);

export const deleteItem = createAsyncThunk(
  "inventory/deleteItem",
  async (id, thunkAPI) => {

    try{
    await api.delete(`/inventory/${id}`);
   return id;
    }

   catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to delete item"
      );
    }
  }
);

//Slice (state shape + how each thunk state changes it)
/*
    reducers are for synchronous actions.

    Example:

    increment()
    toggleTheme()

    We don't need any right now because
    everything is handled by async thunks.
  */

//   reducers: {},

  /*
    extraReducers listens for actions that
    come from createAsyncThunk.

    Builder lets us register handlers for

    pending
    fulfilled
    rejected
  */
 //AI GENERATED SUMMARY FOR REFERENCE AND REFRESHMENTS

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    items: [],
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    // no plain synchronous reducers needed yet — everything goes through thunks
  },
 extraReducers: (builder) => {
    builder

      // ======================================================
      // FETCH ITEMS
      // ======================================================

      .addCase(fetchItems.pending, (state) => {
        // API request started

        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchItems.fulfilled, (state, action) => {
        // API succeeded

        state.status = "succeeded";

        

        state.items = action.payload;
      })

      .addCase(fetchItems.rejected, (state, action) => {
        state.status = "failed";

        /*
          action.payload contains the string
          we passed to rejectWithValue()
        */

        state.error = action.payload;
      })

      // ======================================================
      // ADD ITEM
      // ======================================================

      .addCase(addItem.pending, (state) => {
        state.error = null;
      })

      .addCase(addItem.fulfilled, (state, action) => {
        /*
          action.payload

          {
             id:7,
             name:"Laptop",
             ...
          }

          Push into items array.
        */

        state.items.push(action.payload);
      })

      .addCase(addItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      
      // UPDATE ITEM
      
      .addCase(updateItem.pending, (state) => {
        state.error = null;
      })

      .addCase(updateItem.fulfilled, (state, action) => {
        /*
          Find the item whose id matches
          the updated item.
        */

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        /*
          If found, replace it.
        */

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      
      // DELETE ITEM

      .addCase(deleteItem.pending, (state) => {
        state.error = null;
      })

      .addCase(deleteItem.fulfilled, (state, action) => {
        /*
          action.payload is only the id.

          Example

          5
ai generated info again for refernce only
          Remove the item whose id is 5.
        */

        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
      })

      .addCase(deleteItem.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export reducer so it can be added to the Redux store.
export default inventorySlice.reducer;