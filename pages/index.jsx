import Link from "next/link";
import NearbyPosts from "./posts";
import { useAppContext } from "../context/state";

export default function Home() {
  const { token } = useAppContext(); // get the current user token

  return (
    <div>
      <div className="welcome">
        Welcome to Artisend
      </div>

      {token && (
        <div>
          <Link href="/newPost">
            <button>
              Create Post
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