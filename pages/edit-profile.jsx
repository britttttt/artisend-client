import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import Layout from "../components/layout";
import Navbar from "../components/navbar";
import { useAppContext } from "../context/state";
import { getUserProfile, updateUserProfile, getUserAccount, updateUserAccount } from "../data/auth";
import styles from '../styles/Register.module.css';

export default function EditProfile() {
    const { token, profile } = useAppContext();
    const [isBusiness, setIsBusiness] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [username, setUsername] = useState("")

    const router = useRouter();

    // Normalize profile data (handle array/object formats)
    const profileData = Array.isArray(profile) ? profile[0] : profile;

    useEffect(() => {
        console.log('useEffect triggered');
        console.log('Token exists:', !!token);
        console.log('Token value:', token);
        
        // Fetch actual user account data, not business profile
        if (token) {
            console.log('Fetching user account from API');
            setLoading(true);
            getUserAccount(token).then((data) => {
                console.log('User account API response:', data);
                console.log('Data type:', typeof data);
                console.log('Is array:', Array.isArray(data));
                
                const normalizedData = Array.isArray(data) ? data[0] : data;
                console.log('Normalized data:', normalizedData);
                console.log('Available fields:', Object.keys(normalizedData || {}));
                
                setFirstName(normalizedData?.first_name || "");
                setLastName(normalizedData?.last_name || "");
                setEmail(normalizedData?.email || "");
                setPostalCode(normalizedData?.postal_code || "");
                setUsername(normalizedData?.username || "");
                setIsBusiness(normalizedData?.is_business || false);
                
                console.log('Set values:', {
                    firstName: normalizedData?.first_name,
                    lastName: normalizedData?.last_name,
                    email: normalizedData?.email,
                    postalCode: normalizedData?.postal_code,
                    username: normalizedData?.username
                });
                
                setLoading(false);
            }).catch((err) => {
                console.error('Failed to fetch user account:', err);
                setLoading(false);
            });
        } else {
            console.log('No token available');
        }
    }, [token]);

    const submit = (e) => {
        e.preventDefault();

        const user = {
            username,
            first_name: firstName,
            last_name: lastName,
            email,
            postal_code: postalCode,
            avatar,
        };

        updateUserAccount(token, user)
            .then((res) => {
                console.log("Profile updated:", res);
                alert("Profile updated successfully!");
                router.push("/"); // redirect after update
            })
            .catch((err) => {
                console.error("Update failed:", err);
                alert("An error occurred while updating your profile.");
            });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.column}>
                    <div className={styles.form}>
                        <p className={styles.title}>Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.column}>
                <form className={styles.form} onSubmit={submit}>
                    <h1 className={styles.title}>Edit Profile</h1>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="firstName">First Name (optional)</label>
                        <input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            type="text"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="lastName">Last Name (optional)</label>
                        <input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            type="text"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="email">Email</label>
                        <input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="postalCode">Postal/Zip Code</label>
                        <input
                            id="postalCode"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            type="text"
                            className={styles.input}
                            pattern="[0-9]{5}"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="username">Username</label>
                        <input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Avatar (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAvatar(e.target.files[0])}
                            className={styles.fileInput}
                        />
                        {avatar && (
                            <div className={styles.previewContainer}>
                                <img
                                    src={URL.createObjectURL(avatar)}
                                    alt="Preview"
                                    className={styles.previewImage}
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.accountTypeGroup}>
                        <label className={styles.label}>Account type</label>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="accountType"
                                    checked={!isBusiness}
                                    onChange={() => setIsBusiness(false)}
                                    className={styles.radioInput}
                                />
                                Personal/Individual
                            </label>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="accountType"
                                    checked={isBusiness}
                                    onChange={() => setIsBusiness(true)}
                                    className={styles.radioInput}
                                />
                                Business
                            </label>
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.submitButton} type="submit">Update</button>
                        <Link href="/" className={styles.cancelButton}>
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

EditProfile.getLayout = function getLayout(page) {
    return (
        <Layout>
            <Navbar />
            {page}
        </Layout>
    );
};