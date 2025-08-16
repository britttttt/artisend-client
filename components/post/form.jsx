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
  const { profile } = useAppContext();
  const profileData = profile?.[0];

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

  // Initialize postal code from profile
  useEffect(() => {
    if (profileData?.postalCode) {
      setPostalCode(profileData.postalCode);
    }
  }, [profileData]);

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

    if (!profileData?.id) {
      setError("You must be logged in to create a post.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get coordinates
      const coords = await getCoordinates(postalCode);

      // Prepare form data
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
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "500px", margin: "0 auto" }}
    >
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%" }}
          disabled={loading}
        />
      </div>

      <div>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          style={{ width: "100%" }}
          disabled={loading}
        />
      </div>

      <div>
        <label>Postal Code:</label>
        <input
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label>Date Posted:</label>
        <input
          type="date"
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label>Image (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          disabled={loading}
        />
        {image && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
          </div>
        )}
      </div>

      <div>
        <label>Category:</label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "5px",
          }}
        >
          {categories.map((cat) => (
            <label key={cat.id} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={categoryId === String(cat.id)}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={loading}
              />
              {cat.label}
            </label>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Create Post"}
      </button>
    </form>
  );
}