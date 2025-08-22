import styles from "../styles/profile.module.css";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/state";
import UserPosts from "../components/user-posts";
import Layout from "../components/layout";
import Navbar from "../components/navbar";
import { getUserProfile, getUserAccount } from "../data/auth";

export default function Profile() {
  const { profile, setProfile, token, loadingProfile } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await getUserProfile();
      if (profileData) {
        const normalizedProfile = Array.isArray(profileData)
          ? profileData[0]
          : profileData;
        console.log("Fetched fresh profile from API:", normalizedProfile);
        setProfile(normalizedProfile);
        localStorage.setItem("userProfile", JSON.stringify(normalizedProfile));
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Could not fetch profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccount = async () => {
    if (!token) return;
    try {
      const userData = await getUserAccount(token);
      setUserAccount(userData);
    } catch (err) {
      console.error("Failed user account fetch", err);
    }
  };

  useEffect(() => {
    if (token) fetchUserAccount();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (profile) {
      const profileToSave = Array.isArray(profile) ? profile[0] : profile;
      localStorage.setItem("userProfile", JSON.stringify(profileToSave));
    } else {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          const normalizedProfile = Array.isArray(parsedProfile)
            ? parsedProfile[0]
            : parsedProfile;
          console.log("Restored profile from localStorage:", normalizedProfile);
          setProfile(normalizedProfile);
        } catch (e) {
          console.error("Failed to parse saved profile:", e);
          localStorage.removeItem("userProfile");
          fetchProfile();
        }
      } else {
        console.log("No saved profile found, fetching from API");
        fetchProfile();
      }
    }
  }, [token, profile]);

  if (loadingProfile) return <p>Loading user session...</p>;

  if (!token) {
    return (
      <div>
        <h1>Profile</h1>
        <p>You must be logged in and cool to view this page.</p>
        <p>
          <a href="/login">Click here to login</a>
        </p>
      </div>
    );
  }

  if (loading) return <p>Loading profile data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile data available.</p>;

  const profileData = Array.isArray(profile) ? profile[0] : profile;

  const formatSocialLink = (link) => {
    if (!link) return null;
    return link.startsWith("http") ? link : `https://${link}`;
  };

  const socialLink = formatSocialLink(profileData?.social_link);

  return (
    <div>
      <div className={styles.profileBannerContainer}>
        {profileData?.banner_img && (
          <img
            src={profileData.banner_img}
            alt={`${profileData.display_name} banner`}
            className={styles.profileBanner}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {userAccount?.profile_pic && (
          <img
            src={userAccount.profile_pic}
            alt={`${userAccount.username} avatar`}
            className={styles.profileAvatar}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        {["about", "posts", "portfolio"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.activeTab : ""
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "about" && (
          <div>
            <h3>{profileData?.display_name || profileData?.name || "User"}</h3>
            <p>
              <strong>Business Email:</strong>{" "}
              {profileData?.business_email || "Not provided"}
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              {profileData?.phone || "Not provided"}
            </p>
            {profileData?.business_address && (
              <p>
                <strong>Address:</strong> {profileData.business_address}
              </p>
            )}
            <p>
              <strong>Bio:</strong>{" "}
              {profileData?.bio || "No bio available"}
            </p>
           {profileData?.mediums?.length > 0 && (
  <p><strong>Mediums:</strong> {profileData.mediums.map(m => m.medium).join(", ")}</p>
)}
{profileData?.skills?.length > 0 && (
  <p><strong>Skills:</strong> {profileData.skills.map(s => s.label).join(", ")}</p>
)}
            <p>
              <strong>Commissions:</strong>{" "}
              {profileData?.commissions_open ? "Open" : "Closed"}
            </p>

            {socialLink && (
              <p>
                <strong>Social Link:</strong>{" "}
                <a
                  href={socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  {profileData.social_link}
                </a>
              </p>
            )}

            {profileData?.mediums?.length > 0 && (
              <p>
                <strong>Mediums:</strong>{" "}
                {profileData.mediums.join(", ")}
              </p>
            )}

            {profileData?.skills?.length > 0 && (
              <p>
                <strong>Skills:</strong>{" "}
                {profileData.skills.join(", ")}
              </p>
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div>
            {profileData?.user ? (
              <UserPosts userId={profileData.user} token={token} />
            ) : (
              <div className={styles.warningBox}>
                <p>Unable to load posts!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "portfolio" && (
          <div>
            <p className={styles.portfolioComingSoon}>
              Portfolio coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

Profile.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Navbar />
      {page}
    </Layout>
  );
};