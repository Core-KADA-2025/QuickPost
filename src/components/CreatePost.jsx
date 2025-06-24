import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addPost } from '../store/postSlice'

const CreatePost = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      // Dispatch the addPost action
      dispatch(addPost({
        title: formData.title.trim(),
        body: formData.body.trim()
      }))

      // Navigate immediately back to home page
      navigate('/')

    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-post">
      <div className="form-header">
        <h1>Create New Post</h1>
        <button 
          type="button" 
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Cancel
        </button>
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
            onClick={() => navigate('/')}
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
            {isSubmitting ? 'Creating Post...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost