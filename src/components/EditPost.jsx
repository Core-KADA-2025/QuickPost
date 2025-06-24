import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { updatePost, updatePostAPI } from '../store/postSlice'

const EditPost = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { fetchedPosts, localPosts } = useSelector((state) => state.posts)
  
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [post, setPost] = useState(null)
  const [isLocal, setIsLocal] = useState(false)

  useEffect(() => {
    // Find the post to edit
    const localPost = localPosts.find(p => p.id.toString() === id)
    if (localPost) {
      setPost(localPost)
      setIsLocal(true)
      setFormData({
        title: localPost.title,
        body: localPost.body
      })
      return
    }

    const fetchedPost = fetchedPosts.find(p => p.id.toString() === id)
    if (fetchedPost) {
      setPost(fetchedPost)
      setIsLocal(false)
      setFormData({
        title: fetchedPost.title,
        body: fetchedPost.body
      })
      return
    }

    // Post not found, redirect to home
    navigate('/')
  }, [id, localPosts, fetchedPosts, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.body.trim()) {
      alert('Please fill in both title and body fields.')
      return
    }

    setIsSubmitting(true)
    
    try {
      if (isLocal) {
        // Update local post
        dispatch(updatePost({
          id: parseInt(id),
          title: formData.title.trim(),
          body: formData.body.trim()
        }))
      } else {
        // Update via API
        dispatch(updatePostAPI({
          id: parseInt(id),
          postData: {
            id: parseInt(id),
            title: formData.title.trim(),
            body: formData.body.trim(),
            userId: post.userId
          }
        }))
      }

      navigate(`/post/${id}`)
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!post) {
    return (
      <div className="loading">
        <h2>Loading post...</h2>
      </div>
    )
  }

  return (
    <div className="edit-post">
      <div className="form-header">
        <h1>Edit Post</h1>
        <div className="header-actions">
          {isLocal && <div className="post-badge">Your Post</div>}
          <button 
            type="button" 
            onClick={() => navigate(`/post/${id}`)}
            className="back-button"
          >
            ← Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your post title..."
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">Content *</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Write your post content here..."
            rows={8}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/post/${id}`)}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.body.trim()}
            className="submit-button"
          >
            {isSubmitting ? 'Updating Post...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditPost