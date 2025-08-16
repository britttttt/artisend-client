import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../context/state';

export default function NearbyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    const fetchNearbyPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('http://localhost:8000/posts/nearby?radius=25', {
          headers: { Authorization: `Token ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch nearby posts');

        const data = await res.json();
        setPosts(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
        setError('Could not fetch nearby posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPosts();
  }, [token]);

  const goToPost = (id) => router.push(`/posts/${id}`);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>{error}</p>;
  if (posts.length === 0) return <p>No posts found nearby.</p>;

  return (
    <div>
      <h1>Posts in Your Area</h1>
      {posts.map(post => (
        <div
          key={post.id}
          className="box"
          onClick={() => goToPost(post.id)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={post.profile_image} alt={post.display_name} width={50} height={50} />
            <h2>{post.display_name}</h2>
          </div>
          <h3>{post.title}</h3>
        </div>
      ))}
    </div>
  );
}