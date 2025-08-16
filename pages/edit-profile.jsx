import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { Input } from "../components/form-elements";
import Layout from "../components/layout";
import Navbar from "../components/navbar";
import { useAppContext } from "../context/state";
import { getUserProfile, updateUserProfile, getUserAccount, updateUserAccount } from "../data/auth";

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

    if (loading) return <p>Loading profile...</p>;

    return (
        <div className="columns is-centered">
            <div className="column is-half">
                <form className="box" onSubmit={submit}>
                    <h1 className="title">Edit Profile</h1>

                    <Input
                        id="firstName"
                        value={firstName}
                        onChangeEvent={(e) => setFirstName(e.target.value)}
                        type="text"
                        label="First Name (optional)"
                    />
                    <Input
                        id="lastName"
                        value={lastName}
                        onChangeEvent={(e) => setLastName(e.target.value)}
                        type="text"
                        label="Last Name (optional)"
                    />
                    <Input
                        id="email"
                        value={email}
                        onChangeEvent={(e) => setEmail(e.target.value)}
                        type="email"
                        label="Email"
                        required
                    />
                    <Input
                        id="postalCode"
                        value={postalCode}
                        onChangeEvent={(e) => setPostalCode(e.target.value)}
                        type="text"
                        label="Postal/Zip Code"
                        pattern="[0-9]{5}"
                        required
                    />
                    <Input
                        id="username"
                        value={username}
                        onChangeEvent={(e) => setUsername(e.target.value)}
                        type="text"
                        label="Username"
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatar(e.target.files[0])}
                    />

                    <div className="field">
                        <label className="label">Account type</label>
                        <div className="control">
                            <label className="radio">
                                <input
                                    type="radio"
                                    name="accountType"
                                    checked={!isBusiness}
                                    onChange={() => setIsBusiness(false)}
                                />
                                &nbsp;Personal/Individual
                            </label>
                            &nbsp;&nbsp;
                            <label className="radio">
                                <input
                                    type="radio"
                                    name="accountType"
                                    checked={isBusiness}
                                    onChange={() => setIsBusiness(true)}
                                />
                                &nbsp;Business
                            </label>
                        </div>
                    </div>

                    <div className="field is-grouped">
                        <div className="control">
                            <button className="button is-link" type="submit">Update</button>
                        </div>
                        <div className="control">
                            <Link href="/">
                                <button className="button is-link" type="button">Cancel</button>
                            </Link>
                        </div>
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