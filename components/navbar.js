import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/state'
import styles from '../styles/navbar.module.css'
import Image from 'next/image'
import { getUserAccount } from '../data/auth'

export default function Navbar() {
  const { token, profile } = useAppContext()
  const hamburger = useRef()
  const navbar = useRef()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userAccount, setUserAccount] = useState(null)


  useEffect(() => {
    if (token) {
      setIsLoggedIn(true)
    }
  }, [token])


useEffect(() => {
  const fetchUserAccount = async () => {
    if (!token) return;

    try {
      const userData = await getUserAccount(token)
      setUserAccount(userData)
    } catch (err) {
      console.error('Failed user account fetch')
    }
  }

  if (token) {
    fetchUserAccount()
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
          {userAccount?.profile_pic || profile?.profile_image ? (
            <img
              src={userAccount.profile_pic}
              alt={`${userAccount.username} avatar`}
              className={styles.profileAvatar}
              width={50}
              height={50}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <span className={styles.userIcon}>
              <i className="fas fa-user-circle"></i>
            </span>
          )}
          <span>{ userAccount?.username || profile?.username || "User"}</span>
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
          <img
            src="/images/artisend-logo-crop.png"
            alt="Artisend Logo"
            width={200}
            height={60}
          />
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