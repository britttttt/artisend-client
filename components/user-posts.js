import { useState, useEffect } from "react";
import axios from "axios";

export default function UserPosts({ userId, token }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    if (!userId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`http://localhost:8000/posts?user=${userId}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      setError("Could not fetch posts.");
    } finally {
      setLoading(false);
    }
  };

  // Only run when userId and token are available
  useEffect(() => {
    fetchPosts();
  }, [userId, token]);

  if (!userId || !token) return <p>Please log in to view posts.</p>;
  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>{error}</p>;
  if (!posts.length) return <p>No posts found.</p>;

  return (
    <div>
      <h2>User Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}