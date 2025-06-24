import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { deletePost, deletePostAPI } from '../store/postSlice'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { fetchedPosts, localPosts } = useSelector((state) => state.posts)
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    const findPost = () => {
      const localPost = localPosts.find(p => p.id.toString() === id)
      if (localPost) {
        setPost({ ...localPost, isLocal: true })
        setLoading(false)
        return
      }

      const fetchedPost = fetchedPosts.find(p => p.id.toString() === id)
      if (fetchedPost) {
        setPost({ ...fetchedPost, isLocal: false })
        setLoading(false)
        fetchComments(id)
        return
      }

      setPost(null)
      setLoading(false)
    }

    findPost()
  }, [id, localPosts, fetchedPosts])

  const fetchComments = async (postId) => {
    setCommentsLoading(true)
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
      if (response.ok) {
        const commentsData = await response.json()
        setComments(commentsData)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      if (post.isLocal) {
        dispatch(deletePost(post.id))
      } else {
        dispatch(deletePostAPI(post.id))
      }
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading post...</h2>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="not-found">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        <Link to="/" className="back-button">
          ← Back to Posts
        </Link>
      </div>
    )
  }

  return (
    <div className="post-detail">
      <div className="post-header">
        <Link to="/" className="back-button">
          ← Back to Posts
        </Link>
        <div className="post-header-actions">
          {post.isLocal && <div className="post-badge">Your Post</div>}
          <div className="action-buttons">
            <Link to={`/edit/${post.id}`} className="btn-edit">
              Edit Post
            </Link>
            <button onClick={handleDelete} className="btn-delete">
              Delete Post
            </button>
          </div>
        </div>
      </div>

      <article className="post-content">
        <h1>{post.title}</h1>
        <div className="post-meta">
          {post.isLocal ? (
            <>
              <span>Created: {new Date(post.createdAt).toLocaleString()}</span>
              {post.updatedAt && (
                <span> • Updated: {new Date(post.updatedAt).toLocaleString()}</span>
              )}
            </>
          ) : (
            <span>User ID: {post.userId} • Post ID: {post.id}</span>
          )}
        </div>
        <div className="post-body">
          <p>{post.body}</p>
        </div>
      </article>

      {!post.isLocal && (
        <div className="comments-section">
          <h3>Comments ({comments.length})</h3>
          {commentsLoading ? (
            <p>Loading comments...</p>
          ) : (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment">
                  <h4>{comment.name}</h4>
                  <p className="comment-email">{comment.email}</p>
                  <p>{comment.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PostDetail