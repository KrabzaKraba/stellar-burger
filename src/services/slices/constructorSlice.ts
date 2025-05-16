import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TConstructorIngredient, TOrder } from '@utils-types';
import { orderBurgerApi } from '@api';
import { nanoid } from 'nanoid';

export interface constructorState {
  isLoading: boolean;
  constructorItems: {
    bun: TConstructorIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
}

const initialState: constructorState = {
  isLoading: false,
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: null,
  error: null
};

export const sendOrderThunk = createAsyncThunk(
  'constructorbg/sendOrder',
  (data: string[]) => orderBurgerApi(data)
);

// Action creator для добавления ингредиента
export const addIngredientAction = (ingredient: TConstructorIngredient) => ({
  type: 'constructorbg/addIngredient',
  payload: {
    ...ingredient,
    id: nanoid() // Генерация UUID здесь
  }
});

const constructorSlice = createSlice({
  name: 'constructorbg',
  initialState,
  reducers: {
    addIngredient: (state, action) => {
      if (action.payload.type === 'bun') {
        state.constructorItems.bun = action.payload;
      } else {
        state.constructorItems.ingredients.push(action.payload); // id уже будет в payload
      }
    },
    removeIngredient: (state, action) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (ingredient) => ingredient.id !== action.payload
        );
    },
    setOrderRequest: (state, action) => {
      state.orderRequest = action.payload;
    },
    setNullOrderModalData: (state) => {
      state.orderModalData = null;
    },
    moveIngredientDown: (state, action) => {
      const { payload } = action;
      const ingredients = state.constructorItems.ingredients;
      if (payload < ingredients.length - 1) {
        [ingredients[payload], ingredients[payload + 1]] = [ingredients[payload + 1], ingredients[payload]];
      }
    },
    moveIngredientUp: (state, action) => {
      const { payload } = action;
      const ingredients = state.constructorItems.ingredients;
      if (payload > 0) {
        [ingredients[payload], ingredients[payload - 1]] = [ingredients[payload - 1], ingredients[payload]];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOrderThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOrderThunk.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message as string;
      })
      .addCase(sendOrderThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.orderRequest = false;
        state.orderModalData = payload.order;
        state.constructorItems = {
          bun: null,
          ingredients: []
        };
      });
  }
});

export { initialState as constructorInitialState };
export const {
  removeIngredient,
  setOrderRequest,
  setNullOrderModalData,
  moveIngredientDown,
  moveIngredientUp
} = constructorSlice.actions;

export default constructorSlice.reducer;
