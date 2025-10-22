import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: {},  // Dictionary of products by ID
    loading: false,
    error: null
  },
  reducers: {
    setProduct: (state, action) => {
      const product = action.payload;
      state.items[product._id] = {
        ...state.items[product._id],
        ...product
      };
    },
    updateProductReview: (state, action) => {
      const { productId, reviews, statistics } = action.payload;
      if (state.items[productId]) {
        state.items[productId] = {
          ...state.items[productId],
          reviews: reviews,
          averageRating: statistics.averageRating,
          totalReviews: statistics.totalReviews,
          ratingCounts: statistics.ratingCounts
        };
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setProduct, updateProductReview, setLoading, setError } = productSlice.actions;

// Thunk for submitting a review
export const submitProductReview = (productId, reviewData) => async (dispatch, getState) => {
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
  if (!token) {
    dispatch(setError("Please login to submit a review"));
    return;
  }

  try {
    dispatch(setLoading(true));
    
    const response = await fetch(`http://localhost:5000/api/reviews/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    // Fetch updated reviews after submission
    const updatedData = await fetch(`http://localhost:5000/api/reviews/${productId}/reviews`).then(res => res.json());
    
    // Update product in store with new reviews and statistics
    dispatch(updateProductReview({
      productId,
      reviews: updatedData.reviews,
      statistics: updatedData.statistics
    }));

  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for fetching product reviews
export const fetchProductReviews = (productId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(`http://localhost:5000/api/reviews/${productId}/reviews`);
    const data = await response.json();
    
    dispatch(updateProductReview({
      productId,
      reviews: data.reviews,
      statistics: data.statistics
    }));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default productSlice.reducer;