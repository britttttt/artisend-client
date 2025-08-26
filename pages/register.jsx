import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import Layout from '../components/layout'
import Navbar from '../components/navbar'
import { useAppContext } from '../context/state'
import { register } from '../data/auth'
import styles from '../styles/Register.module.css'

export default function Register() {
  const { setToken } = useAppContext()
  const [isBusiness, setIsBusiness] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [activeTab, setActiveTab] = useState('about')

  const firstName = useRef(null)
  const lastName = useRef(null)
  const email = useRef(null)
  const postalCode = useRef(null)
  const username = useRef(null)
  const password = useRef(null)

  const router = useRouter()

  const submit = (e) => {
    e.preventDefault();

    const user = {
      username: username.current?.value,
      password: password.current?.value,
      first_name: firstName.current?.value,
      last_name: lastName.current?.value,
      email: email.current?.value,
      postal_code: postalCode.current?.value,
      avatar,
      is_business: isBusiness,
      is_admin: false
    };

    register(user)
    .then((res) => {
      console.log('Register response:', res);
      if (res && res.token) {
        setToken(res.token);
        if (isBusiness) {
          router.push('/businessProfile');
        } else {
          router.push('/');
        }
      } else {
        alert(res?.error || 'Registration failed.');
      }
    })
    .catch((err) => {
      console.error('Register failed:', err);
      alert('An error occurred during registration.');
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <form className={styles.form} onSubmit={submit}>
          <h1 className={styles.title}>Welcome!</h1>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="firstName">First Name (optional)</label>
            <input
              id="firstName"
              ref={firstName}
              type="text"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="lastName">Last Name (optional)</label>
            <input
              id="lastName"
              ref={lastName}
              type="text"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              ref={email}
              type="email"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="postalCode">Postal/Zip Code</label>
            <input
              id="postalCode"
              ref={postalCode}
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
              ref={username}
              type="text"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              ref={password}
              type="password"
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
            <button className={styles.submitButton} type="submit">Submit</button>
            <Link href="/login" className={styles.cancelButton}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

Register.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Navbar />
      {page}
    </Layout>
  )
}