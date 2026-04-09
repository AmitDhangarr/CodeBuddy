'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message }),
    })

    const data = await res.json()

    if (res.ok) {
      setStatus('✅ Message sent!')
    } else {
      setStatus('❌ ' + data.error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Your email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <textarea
        placeholder="Your message"
        onChange={(e) => setMessage(e.target.value)}
        required
      />

      <button type="submit">Send</button>

      <p>{status}</p>
    </form>
  )
}