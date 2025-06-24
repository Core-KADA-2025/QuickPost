import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchPosts, deletePost, deletePostAPI, clearMessages } from '../store/postSlice'

const PostList = () => {
  const dispatch = useDispatch()
  const { fetchedPosts, localPosts, loading, error, success } = useSelector((state) => state.posts)
  const [userNames, setUserNames] = useState({})
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (fetchedPosts.length === 0) {
      dispatch(fetchPosts())
    }
  }, [dispatch, fetchedPosts.length])

  // Fetch user names when fetchedPosts change
  useEffect(() => {
    const fetchUserNames = async () => {
      if (fetchedPosts.length === 0) return

      setLoadingUsers(true)
      const uniqueUserIds = [...new Set(fetchedPosts.map(post => post.userId))]
      const newUserNames = {}

      try {
        // Fetch all user details in parallel
        const userPromises = uniqueUserIds.map(async (userId) => {
          if (userNames[userId]) return // Skip if already cached
          
          try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
            if (response.ok) {
              const user = await response.json()
              return { userId, user }
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error)
            return { userId, user: null }
          }
        })

        const userResults = await Promise.all(userPromises)
        
        userResults.forEach(result => {
          if (result && result.user) {
            newUserNames[result.userId] = result.user.name
          } else if (result) {
            newUserNames[result.userId] = `User ${result.userId}`
          }
        })

        setUserNames(prev => ({ ...prev, ...newUserNames }))
      } catch (error) {
        console.error('Error fetching user names:', error)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUserNames()
  }, [fetchedPosts])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error, dispatch])

  const handleDelete = (post) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      if (post.isLocal || localPosts.some(p => p.id === post.id)) {
        dispatch(deletePost(post.id))
      } else {
        dispatch(deletePostAPI(post.id))
      }
    }
  }

  const getUserName = (userId) => {
    if (loadingUsers && !userNames[userId]) {
      return "Loading..."
    }
    return userNames[userId] || `User ${userId}`
  }

  const allPosts = [...localPosts, ...fetchedPosts]

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading posts...</h2>
      </div>
    )
  }

  return (
    <div className="post-list">
      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="header">
        <h1>All Posts ({allPosts.length})</h1>
        <Link to="/create" className="create-button">
          Create New Post
        </Link>
      </div>

      {localPosts.length > 0 && (
        <div className="local-posts-section">
          <h2>Your Posts ({localPosts.length})</h2>
          <div className="posts-grid">
            {localPosts.map(post => (
              <div key={`local-${post.id}`} className="post-card local-post">
                <div className="post-badge">Your Post</div>
                <h3>
                  <Link to={`/post/${post.id}`} className="post-title-link">
                    {post.title}
                  </Link>
                </h3>
                <p className="post-preview">
                  {post.body.length > 150 
                    ? `${post.body.substring(0, 150)}...` 
                    : post.body
                  }
                </p>
                <div className="post-meta">
                  <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.updatedAt && (
                    <span> • Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="post-actions">
                  <Link to={`/edit/${post.id}`} className="btn-edit">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(post)} 
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fetched-posts-section">
        <h2>Community Posts ({fetchedPosts.length})</h2>
        <div className="posts-grid">
          {fetchedPosts.map(post => (
            <div key={`fetched-${post.id}`} className="post-card">
              <h3>
                <Link to={`/post/${post.id}`} className="post-title-link">
                  {post.title}
                </Link>
              </h3>
              <p className="post-preview">
                {post.body.length > 150 
                  ? `${post.body.substring(0, 150)}...` 
                  : post.body
                }
              </p>
              <div className="post-meta">
                <span>👤 By: {getUserName(post.userId)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PostList