import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Helper functions for localStorage
const loadLocalPosts = () => {
  try {
    const serializedPosts = localStorage.getItem('localPosts')
    if (serializedPosts === null) {
      return []
    }
    return JSON.parse(serializedPosts)
  } catch (err) {
    console.error('Could not load local posts:', err)
    return []
  }
}

const saveLocalPosts = (posts) => {
  try {
    const serializedPosts = JSON.stringify(posts)
    localStorage.setItem('localPosts', serializedPosts)
  } catch (err) {
    console.error('Could not save local posts:', err)
  }
}

// Async thunk for fetching posts from API
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    return response.json()
  }
)

// Async thunk for updating post via API
export const updatePostAPI = createAsyncThunk(
  'posts/updatePostAPI',
  async ({ id, postData }) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to update post')
    }
    return response.json()
  }
)

// Async thunk for deleting post via API
export const deletePostAPI = createAsyncThunk(
  'posts/deletePostAPI',
  async (id) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete post')
    }
    return id
  }
)

const initialState = {
  fetchedPosts: [],
  localPosts: loadLocalPosts(), // Load from localStorage on initialization
  loading: false,
  error: null,
  success: null
}

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action) => {
      const newPost = {
        id: Date.now(), // Simple ID generation
        title: action.payload.title,
        body: action.payload.body,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        isLocal: true
      }
      state.localPosts.push(newPost)
      state.success = 'Post created successfully!'
      state.error = null
      
      // Save to localStorage
      saveLocalPosts(state.localPosts)
    },
    
    updatePost: (state, action) => {
      const { id, title, body } = action.payload
      const postIndex = state.localPosts.findIndex(post => post.id === id)
      
      if (postIndex !== -1) {
        state.localPosts[postIndex] = {
          ...state.localPosts[postIndex],
          title,
          body,
          updatedAt: new Date().toISOString()
        }
        state.success = 'Post updated successfully!'
        state.error = null
        
        // Save to localStorage
        saveLocalPosts(state.localPosts)
      }
    },
    
    deletePost: (state, action) => {
      const id = action.payload
      state.localPosts = state.localPosts.filter(post => post.id !== id)
      state.success = 'Post deleted successfully!'
      state.error = null
      
      // Save to localStorage
      saveLocalPosts(state.localPosts)
    },
    
    clearMessages: (state) => {
      state.success = null
      state.error = null
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false
        state.fetchedPosts = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // Update post API
      .addCase(updatePostAPI.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePostAPI.fulfilled, (state, action) => {
        state.loading = false
        const updatedPost = action.payload
        const postIndex = state.fetchedPosts.findIndex(post => post.id === updatedPost.id)
        
        if (postIndex !== -1) {
          state.fetchedPosts[postIndex] = updatedPost
        }
        state.success = 'Post updated successfully!'
      })
      .addCase(updatePostAPI.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // Delete post API
      .addCase(deletePostAPI.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePostAPI.fulfilled, (state, action) => {
        state.loading = false
        const deletedId = action.payload
        state.fetchedPosts = state.fetchedPosts.filter(post => post.id !== deletedId)
        state.success = 'Post deleted successfully!'
      })
      .addCase(deletePostAPI.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { addPost, updatePost, deletePost, clearMessages } = postSlice.actions
export default postSlice.reducer