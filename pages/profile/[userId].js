import styles from "../../styles/profile.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../../context/state";
import UserPosts from "../../components/user-posts";
import Layout from "../../components/layout";
import Navbar from "../../components/navbar";

export default function UserProfile() {
  const router = useRouter();
  const { userId } = router.query;
  const { token } = useAppContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  const fetchUserProfile = async (targetUserId) => {
    if (!targetUserId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const postsUrl = `http://localhost:8000/posts?user=${targetUserId}`;
      const postsRes = await fetch(postsUrl, {
        headers: { Authorization: `Token ${token}` },
      });

      let userData = null;
      let businessData = null;
      
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        const posts = Array.isArray(postsData) ? postsData : postsData.results || [];
        
        if (posts.length > 0) {
          const firstPost = posts[0];
          
          userData = {
            id: firstPost.user_profile?.id || targetUserId,
            username: firstPost.user_profile?.username || 'Unknown User',
            profile_pic: firstPost.user_profile?.profile_pic,
            email: firstPost.user_profile?.email,
            first_name: firstPost.user_profile?.first_name,
            last_name: firstPost.user_profile?.last_name
          };
          
          if (firstPost.user_business) {
            businessData = {
              id: firstPost.user_business.id,
              user: firstPost.user_business.user,
              display_name: firstPost.user_business.display_name,
              bio: firstPost.user_business.bio,
              business_email: firstPost.user_business.business_email,
              phone: firstPost.user_business.phone,
              business_address: firstPost.user_business.business_address,
              social_link: firstPost.user_business.social_link,
              commissions_open: firstPost.user_business.commissions_open,
              banner_img: firstPost.user_business.banner_img,
              mediums: firstPost.user_business.mediums,
              skills: firstPost.user_business.skills
            };
          }
        }
      }

      if (!userData) {
        throw new Error('User not found or has no public content');
      }

      setUserAccount(userData);
      
      if (businessData) {
        setProfileData(businessData);
      } else {
        setProfileData({
          display_name: userData?.username || 'Unknown User',
          user: targetUserId,
          bio: "No business profile available",
          business_email: userData?.email || "Not provided",
        });
      }

    } catch (err) {
      setError("Could not fetch user profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady && userId && token) {
      fetchUserProfile(userId);
    }
  }, [router.isReady, userId, token]);

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.form}>
            <h1 className={styles.title}>Profile</h1>
            <p>You must be logged in to view user profiles.</p>
            <p>
              <a href="/login">Click here to login</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingColumn}>
          <div className={styles.loadingBox}>
            <p className={styles.loadingText}>Loading profile data...</p>
            <div className={styles.progress}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.form}>
            <p style={{ color: "red" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.form}>
            <p>No profile data available.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatSocialLink = (link) => {
    if (!link) return null;
    return link.startsWith("http") ? link : `https://${link}`;
  };

  const socialLink = formatSocialLink(profileData?.social_link);

  return (
    <div>
      <div className={styles.profileBannerContainer}>
        {profileData?.banner_img ? (
          <img
            src={profileData.banner_img}
            alt={`${profileData.display_name} banner`}
            className={styles.profileBanner}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '500px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px'
          }} />
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

      <div className={styles.tabContent}>
        {activeTab === "about" && (
          <div>
            <h3>{profileData?.display_name || userAccount?.username || "User"}</h3>
            <p>
              <strong>Business Email:</strong>{" "}
              {profileData?.business_email || userAccount?.email || "Not provided"}
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
                  style={{ color: '#ff6600', textDecoration: 'underline' }}
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

            {userAccount?.date_joined && (
              <p>
                <strong>Member since:</strong>{" "}
                {new Date(userAccount.date_joined).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div>
            <UserPosts userId={userId} token={token} />
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

UserProfile.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Navbar />
      {page}
    </Layout>
  );
};