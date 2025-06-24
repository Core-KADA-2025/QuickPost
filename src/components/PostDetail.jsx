import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { deletePost, deletePostAPI } from '../store/postSlice'
import PostComment from '../components/PostComment' 

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { fetchedPosts, localPosts } = useSelector((state) => state.posts)
  const [post, setPost] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(false)

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
        fetchUser(fetchedPost.userId)
        return
      }

      setPost(null)
      setLoading(false)
    }

    findPost()
  }, [id, localPosts, fetchedPosts])

  const fetchUser = async (userId) => {
    setUserLoading(true)
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setUserLoading(false)
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
          {post.isLocal && (
            <div className="action-buttons">
              <Link to={`/edit/${post.id}`} className="btn-edit">
                Edit Post
              </Link>
              <button onClick={handleDelete} className="btn-delete">
                Delete Post
              </button>
            </div>
          )}
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
            <span>
              {userLoading ? (
                'Loading author...'
              ) : user ? (
                `Penulis: ${user.name} • Post ID: ${post.id}`
              ) : (
                `User ID: ${post.userId} • Post ID: ${post.id}`
              )}
            </span>
          )}
        </div>
        <div className="post-body">
          <p>{post.body}</p>
        </div>
      </article>

      {/* Replace the old comments section with the new PostComment component */}
      <PostComment post={post} isLocal={post.isLocal} />
    </div>
  )
}

export default PostDetail