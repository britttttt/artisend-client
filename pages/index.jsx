import Link from "next/link";
import { useState, useEffect } from "react";
import NearbyPosts from "./posts";
import { useAppContext } from "../context/state";
import styles from "../styles/posts.module.css"
import HeroCarousel from "../components/hero-banner";

export default function Home() {
  const { token } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);
  const [heroPosts, setHeroPosts] = useState([]);
  const [heroLoading, setHeroLoading] = useState(false);

  // Fetch posts for hero carousel
  useEffect(() => {
    const fetchHeroPosts = async () => {
      if (!token) return;
      
      setHeroLoading(true);
      try {
        // Use a larger radius for hero to get more variety
        const res = await fetch('http://localhost:8000/posts/nearby?radius=50', {
          headers: { Authorization: `Token ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch hero posts');

        const data = await res.json();
        const postsArray = Array.isArray(data) ? data : data.results || [];
        setHeroPosts(postsArray);
      } catch (err) {
        console.error('Error fetching hero posts:', err);
        // Fail silently for hero - don't break the page
        setHeroPosts([]);
      } finally {
        setHeroLoading(false);
      }
    };

    fetchHeroPosts();
  }, [token]);

  return (
    <div>
      <div className="welcome">
        {/* Hero carousel with separate data */}
        <HeroCarousel 
          posts={heroPosts} 
          maxSlides={5}
          loading={heroLoading}
        />
      </div>

      {token && (
        <div>
          <Link href="/newPost">
            <button 
              className={styles.fabButton}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isHovered ? (
                <span>Create Post</span>
              ) : (
                <strong style={{ fontSize: '2em' }}>+</strong>
              )}
            </button>
          </Link>
        </div>
      )}

      {token ? (
        <div>
          <NearbyPosts />
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#666',
          fontSize: '18px'
        }}>
          <p>Please log in to see nearby posts and create a new post.</p>
        </div>
      )}
    </div>
  );
}