import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchPosts, deletePost, deletePostAPI, clearMessages } from '../store/postSlice'

const PostList = () => {
  const dispatch = useDispatch()
  const { fetchedPosts, localPosts, loading, error, success } = useSelector((state) => state.posts)

  useEffect(() => {
    if (fetchedPosts.length === 0) {
      dispatch(fetchPosts())
    }
  }, [dispatch, fetchedPosts.length])

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
                <span>User ID: {post.userId}</span>
              </div>
              {/* Removed post-actions div for community posts */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PostList