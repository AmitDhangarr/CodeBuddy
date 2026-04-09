'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AddTodo() {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title }])

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert('Todo added!')
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter todo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  )
}