import Link from "next/link";
import NearbyPosts from "./posts";
import { useAppContext } from "../context/state";
import styles from "../styles/posts.module.css"
import { useState } from "react";

export default function Home() {
  const { token } = useAppContext();
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div>
      <div className="welcome">
        Welcome to Artisend
      </div>

      {token && (
        <div  >
          <Link href="/newPost">
            <button className={styles.fabButton}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}>
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
        <p>Please log in to see nearby posts and create a new post.</p>
      )}
    </div>
  );
}