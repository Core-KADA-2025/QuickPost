import React from 'react'
import { Routes, Route } from 'react-router-dom'
import PostList from './components/Postlist'
import PostDetail from './components/PostDetail'
import CreatePost from './components/CreatePost'
import EditPost from './components/EditPost'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </div>
  )
}

export default App