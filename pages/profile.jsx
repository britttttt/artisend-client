import { useEffect } from "react";
import { useAppContext } from "../context/state";
import { getUserProfile } from "../data/auth";


export default function Profile() {
  const { profile, setProfile } = useAppContext();

  useEffect(() => {
  getUserProfile().then((profileData) => {
    if (profileData) {
      setProfile(Array.isArray(profileData) ? profileData[0] : profileData);
    }
  });
}, []);

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  const business = profile.business || profile

  return (
    <div>
      <h1>Profile</h1>

      <section>
        <h2>{profile.name || business.display_name}</h2>
      </section>

      {Object.keys(business).length > 0 && (
        <section>
          <h3>Business Information</h3>
          {profile.profile_pic && (
            <img src={user.profile_pic} alt={`${user.name || business.display_name} profile`} />
          )}
          <p><strong>Display Name:</strong> {business.display_name}</p>
          <p><strong>Business Email:</strong> {business.business_email}</p>
          <p><strong>Phone:</strong> {business.phone}</p>
          <p><strong>Address:</strong> {business.business_address}</p>
          <p><strong>Bio:</strong> {business.bio}</p>
          {business.social_link && (
            <p>
              <strong>Social Link:</strong>{" "}
              <a href={business.social_link} target="_blank" rel="noopener noreferrer">
                {business.social_link}
              </a>
            </p>
          )}
          {business.banner_img && (
            <img
              src={business.banner_img}
              alt={`${business.display_name} banner`}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          )}
          {business.mediums && business.mediums.length > 0 && (
            <div>
              <strong>Mediums:</strong>
              <ul>
                {business.mediums.map((m) => (
                  <li key={m.id}>{m.label}</li>
                ))}
              </ul>
            </div>
          )}
          {business.skills && business.skills.length > 0 && (
            <div>
              <strong>Skills:</strong>
              <ul>
                {business.skills.map((s) => (
                  <li key={s.id}>
                    {s.label} {s.mediumLabel && `(${s.mediumLabel})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}