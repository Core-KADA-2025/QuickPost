import React, { useState, useEffect } from 'react'
import './PostComment.css'

const PostComment = ({ post, isLocal = false }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState({ name: '', email: '', body: '' })
  const [isAddingComment, setIsAddingComment] = useState(false)

  // Generate unique key for localStorage based on post ID and type
  const getStorageKey = (postId, isLocal) => {
    return `comments_${isLocal ? 'local' : 'api'}_${postId}`
  }

  // Load comments from localStorage
  const loadLocalComments = (postId, isLocal) => {
    const storageKey = getStorageKey(postId, isLocal)
    const savedComments = localStorage.getItem(storageKey)
    return savedComments ? JSON.parse(savedComments) : []
  }

  // Save comments to localStorage
  const saveLocalComments = (postId, isLocal, comments) => {
    const storageKey = getStorageKey(postId, isLocal)
    localStorage.setItem(storageKey, JSON.stringify(comments))
  }

  useEffect(() => {
    if (post?.id) {
      // Load saved user comments first
      const savedUserComments = loadLocalComments(post.id, isLocal)
      
      if (!isLocal) {
        // For API posts, fetch original comments and merge with saved user comments
        fetchComments(post.id, savedUserComments)
      } else {
        // For local posts, just use saved comments
        setComments(savedUserComments)
      }
    }
  }, [post?.id, isLocal])

  const fetchComments = async (postId, savedUserComments = []) => {
    setLoading(true)
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
      if (response.ok) {
        const apiComments = await response.json()
        // Merge API comments with saved user comments
        const allComments = [...apiComments, ...savedUserComments]
        setComments(allComments)
      } else {
        // If API fails, just use saved user comments
        setComments(savedUserComments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      // If API fails, just use saved user comments
      setComments(savedUserComments)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.name.trim() || !newComment.email.trim() || !newComment.body.trim()) {
      alert('Please fill in all fields')
      return
    }

    const comment = {
      id: Date.now(), // Simple ID generation for local comments
      postId: post.id,
      name: newComment.name.trim(),
      email: newComment.email.trim(),
      body: newComment.body.trim(),
      isUserComment: true, // Flag to identify user-added comments
      timestamp: new Date().toISOString() // Add timestamp for sorting
    }

    const updatedComments = [...comments, comment]
    setComments(updatedComments)
    
    // Save only user comments to localStorage
    const userComments = updatedComments.filter(c => c.isUserComment)
    saveLocalComments(post.id, isLocal, userComments)
    
    setNewComment({ name: '', email: '', body: '' })
    setIsAddingComment(false)
    
    // Show success message
    alert('Comment added successfully!')
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const updatedComments = comments.filter(c => c.id !== commentId)
      setComments(updatedComments)
      
      // Update localStorage with remaining user comments
      const userComments = updatedComments.filter(c => c.isUserComment)
      saveLocalComments(post.id, isLocal, userComments)
      
      alert('Comment deleted successfully!')
    }
  }

  const handleInputChange = (field, value) => {
    setNewComment(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // This condition is no longer needed - we'll show the full component for both cases

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Comments ({comments.length})</h3>
        <button 
          onClick={() => setIsAddingComment(!isAddingComment)}
          className="btn-add-comment"
        >
          {isAddingComment ? 'Cancel' : 'Add Comment'}
        </button>
      </div>

      {(isAddingComment || (comments.length === 0 && !loading)) && (
        <>
          {comments.length === 0 && !loading && !isAddingComment && (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          )}
          {isAddingComment && (
            <div className="add-comment-form">
              <form onSubmit={handleAddComment}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newComment.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={newComment.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Write your comment..."
                    value={newComment.body}
                    onChange={(e) => handleInputChange('body', e.target.value)}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    Post Comment
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingComment(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {loading ? (
        <p className="loading-comments">Loading comments...</p>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className={`comment ${comment.isUserComment ? 'user-comment' : ''}`}>
              <div className="comment-header">
                <h4 className="comment-name">{comment.name}</h4>
                <span className="comment-email">{comment.email}</span>
                {comment.isUserComment && (
                  <div className="comment-actions">
                    <span className="comment-badge">Your Comment</span>
                    <button 
                      className="btn-delete-comment"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete comment"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="comment-body">{comment.body}</p>
              {comment.timestamp && (
                <div className="comment-timestamp">
                  Posted: {new Date(comment.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PostComment