import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../context/state';
import { getBusinessProfileByUserId, getUserAccountById } from '../../data/auth';
import styles from "/styles/posts.module.css"

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
        const postsArray = Array.isArray(data) ? data : data.results || [];
        setPosts(postsArray);

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
    <div style={{display: 'flex', flexDirection:'column', alignItems:'center'}}>
      <h1>Posts in Your Area</h1>
      {posts.map(post => {

        return (
          <div
            key={post.id}
            className={styles.box}
            onClick={() => goToPost(post.id)}
            style={{ cursor: 'pointer', padding:'.5rem', width:'52em', display:'flex', flexDirection:'column'
             }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor:'antiquewhite', flexDirection:'row',}}>
              {post.user_profile.profile_pic && (
                <img
                src={post.user_profile.profile_pic}
                alt={post.user_profile.username || 'User'}
                width={50}
                height={50}
                style={{ objectFit: 'cover', padding:'10px' }}
                />
              )}
              <h4>{post.user_business.display_name || 'Unknown User'}</h4>
              {post.created_at && (
            <div style={{ color: '#666', fontSize: '14px' }}>
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          )}
            </div>
            <div style={{ cursor: 'pointer', padding:'1em', width:'50em', backgroundColor:'white'}} >

              <img src={post.photo}
                className={styles.postPhoto} 
                style={{}}
                height={100}/>
              <h3>{post.title}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}