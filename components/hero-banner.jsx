import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/HeroCarousel.module.css';


export default function HeroCarousel({ posts, maxSlides = 5, loading = false }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [carouselPosts, setCarouselPosts] = useState([]);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const router = useRouter();


    const getPostsWithImages = useCallback(() => {
        if (!posts || posts.length === 0) return [];


        const postsWithImages = posts.filter(post => {
            return post.media && post.media.some(item => item.media_type === 'image');
        });


        const shuffled = [...postsWithImages].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, maxSlides);
    }, [posts, maxSlides]);


    useEffect(() => {
        const newCarouselPosts = getPostsWithImages();
        setCarouselPosts(newCarouselPosts);
        setCurrentSlide(0);
    }, [getPostsWithImages]);


    useEffect(() => {
        if (!isAutoPlaying || carouselPosts.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % carouselPosts.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, carouselPosts.length]);


    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const nextSlide = () => {
        goToSlide((currentSlide + 1) % carouselPosts.length);
    };

    const prevSlide = () => {
        goToSlide(currentSlide === 0 ? carouselPosts.length - 1 : currentSlide - 1);
    };

    const handleSlideClick = (post) => {
        router.push(`/posts/${post.id}`);
    };


    const getPrimaryImage = (post) => {
        const imageMedia = post.media?.find(item => item.media_type === 'image');
        return imageMedia?.file || null;
    };


    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'Escape') setIsAutoPlaying(false);
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentSlide, carouselPosts.length]);


    if (loading || !posts) {
        return (
            <div className={styles.heroContainer}>
                <div className={styles.loadingState}>
                    Discovering amazing posts in your area...
                </div>
            </div>
        );
    }


    if (carouselPosts.length === 0) {
        return (
            <div className={styles.heroContainer}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📸</div>
                    <div className={styles.emptyStateText}>No photos to display</div>
                    <div className={styles.emptyStateSubtext}>
                        Share some posts with images to see them featured here!
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={styles.heroContainer}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className={styles.carousel}>
                {carouselPosts.map((post, index) => {
                    const primaryImage = getPrimaryImage(post);
                    const isActive = index === currentSlide;

                    return (

                        <div
                            key={post.id}
                            className={`${styles.slide} ${isActive ? styles.active : ''}`}
                        >
                                <div className={styles.artisendLogo}>
                                    <img
                                        src="/images/logo-light.png"
                                        alt="Artisend Logo"
                                        width={200}
                                        height={60}
                                    />
                                </div>
                            <div
                                className={styles.slideClickable}
                                onClick={() => handleSlideClick(post)}
                            >
                                {primaryImage && (
                                    <img
                                        src={primaryImage}
                                        alt={post.title}
                                        className={styles.slideImage}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                    />
                                )}
                                <div className={styles.photoOverlay}>
                                    
                                </div>
                                <div className={styles.slideOverlay}>
                                    <div className={styles.slideTitle}>
                                    </div>

                                    <div className={styles.slideAuthor}>
                                        {post.user_business?.display_name || post.user_profile?.username || 'Anonymous'}
                                        {post.created_at && (
                                            <span> • {new Date(post.created_at).toLocaleDateString()}</span>
                                        )}
                                    </div>


                                </div>
                            </div>
                        </div>
                    );
                })}



            </div>
        </div>
    );
}