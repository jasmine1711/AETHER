import { useState } from "react";
export default function ReviewForm({ productId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.ok) { alert('Review submitted'); setComment(''); } else { alert('Failed'); }
  };
  return (
    <form onSubmit={submit} className="space-y-2">
      <select value={rating} onChange={e=>setRating(+e.target.value)} className="border p-2 rounded">
        {[5,4,3,2,1].map(n=><option key={n} value={n}>{n} ★</option>)}
      </select>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write your thoughts…" className="w-full border p-2 rounded" />
      <button className="bg-gray-900 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
}
