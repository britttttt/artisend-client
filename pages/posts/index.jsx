import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function NearbyPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://localhost:8000/posts/nearby?radius=25", {
            headers: {
                Authorization: `Token ${token}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                // If the API returns an object with a `results` array
                setPosts(Array.isArray(data) ? data : data.results || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching posts:', err);
                setLoading(false);
            });
    }, []);

    const goToPost = (id) => {
        router.push(`/posts/${id}`);
    };

    if (loading) return <p>Loading posts...</p>;

    return (
        <div>
            <h1>Posts in Your Area</h1>
            {posts.length === 0 ? (
                <p>No posts found nearby.</p>
            ) : (
                posts.map(post => (
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
                ))
            )}
        </div>
    );
}
