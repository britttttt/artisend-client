import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/state'
import styles from '../styles/navbar.module.css'

export default function Navbar() {
  const { token, profile } = useAppContext()
  const hamburger = useRef()
  const navbar = useRef()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true)
    }
  }, [token])

  const showMobileNavbar = () => {
    hamburger.current.classList.toggle(styles.hamburgerActive)
    navbar.current.classList.toggle(styles.navbarMenuActive)
  }

  const getLoggedInButtons = () => {
    return (
      <div className={styles.navbarDropdownWrapper}>
        <a className={styles.navbarUserLink}>
          {profile?.avatar || profile?.profile_image ? (
            <img
              src={profile.avatar || profile.profile_image}
              alt={profile.display_name || "User"}
              className={styles.userAvatar}
            />
          ) : (
            <span className={styles.userIcon}>
              <i className="fas fa-user-circle"></i>
            </span>
          )}
          <span>{profile?.display_name || profile?.username || "User"}</span>
        </a>
        <div className={styles.navbarDropdown}>
          <Link href="/profile" className={styles.dropdownItem}>
            Business Profile
          </Link>
          <Link href="/businessProfile" className={styles.dropdownItem}>
            Edit Business Profile
          </Link>
          <Link href="/edit-profile" className={styles.dropdownItem}>
            Account Details
          </Link>
          <hr className={styles.dropdownDivider} />
          <a
            className={styles.dropdownItem}
            onClick={() => {
              localStorage.removeItem('token')
              setIsLoggedIn(false)
              window.location.href = "/"
            }}
          >
            Log out
          </a>
        </div>
      </div>
    )
  }

  const getLoggedOutButtons = () => {
    return (
      <div className={styles.authButtons}>
        <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
          <strong>Sign up</strong>
        </Link>
        <Link href="/login" className={`${styles.btn} ${styles.btnLight}`}>
          Log in
        </Link>
      </div>
    )
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link href="/" className={styles.brandLink}>
         Home
        </Link>


        <a
          role="button"
          className={styles.navbarBurger}
          aria-label="menu"
          aria-expanded="false"
          ref={hamburger}
          onClick={showMobileNavbar}
        >
          <span></span>
          <span></span>
          <span></span>
        </a>
      </div>

      <div className={styles.navbarMenu} ref={navbar}>
        <div className={styles.navbarEnd}>
          {isLoggedIn ? getLoggedInButtons() : getLoggedOutButtons()}
        </div>
      </div>
    </nav>
  )
}