import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../../context/state";
import { createPost, getCategories } from "../../data/auth";

export default function PostForm({
  defaultTitle = "",
  defaultContent = "",
  defaultDate = "",
}) {
  const router = useRouter();
  const { profile, loadingProfile } = useAppContext(); // grab loadingProfile from context
  const [postalCode, setPostalCode] = useState("");
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [image, setImage] = useState(null);
  const [datePosted, setDatePosted] = useState(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  // Show loading while profile is loading
  if (loadingProfile) return <p>Loading...</p>;

  // Redirect or error if user not logged in
  if (!profile?.user_id) return <p>You must be logged in to create a post.</p>;

  // Initialize postal code from profile
  useEffect(() => {
    if (profile?.postalCode) {
      setPostalCode(profile.postalCode);
    }
  }, [profile]);

  // Fetch categories
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const getCoordinates = async (postalCode) => {
    const res = await fetch(`https://api.zippopotam.us/us/${postalCode}`);
    if (!res.ok) throw new Error("Invalid postal code");
    const data = await res.json();
    const { latitude, longitude } = data.places[0];
    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const coords = await getCoordinates(postalCode);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", categoryId);
      formData.append("postal_code", postalCode);
      formData.append("latitude", coords.latitude);
      formData.append("longitude", coords.longitude);
      if (image) formData.append("photo", image);

      await createPost(formData);
      router.push("/posts");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "0 auto" }}>
      {/* ... all your input fields here ... */}
    </form>
  );
}