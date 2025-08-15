import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="welcome">
        Welcome to Artisend
      </div>
      <div>
        <Link href="/newPost">
          <button>
            Create Post
          </button>
        </Link>
      </div>
    </div>
  );
}