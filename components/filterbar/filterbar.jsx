import { useState, useEffect } from "react";
import styles from "/styles/PostFilters.module.css";

export default function PostFilter({ posts, onFilteredPostsChange }) {
    const [sortOrder, setSortOrder] = useState('desc');
    const [dateFilter, setDateFilter] = useState('all'); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (posts.length > 0) {
            applyFilters(sortOrder, dateFilter, startDate, endDate);
        }
    }, [posts]);

    const applyFilters = (newSortOrder = sortOrder, newDateFilter = dateFilter, newStartDate = startDate, newEndDate = endDate) => {
        let filteredPosts = [...posts];

        if (newDateFilter !== 'all') {
            const now = new Date();
            let filterStartDate = null;

            switch (newDateFilter) {
                case 'today':
                    filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'custom':

                    filteredPosts = filteredPosts.filter(post => {
                        if (!post.created_at) return true;
                        
                        const postDate = new Date(post.created_at);
                        const start = newStartDate ? new Date(newStartDate) : null;
                        const end = newEndDate ? new Date(newEndDate + 'T23:59:59') : null;
                        
                        if (start && postDate < start) return false;
                        if (end && postDate > end) return false;
                        
                        return true;
                    });
                    break;
            }

            if (filterStartDate) {
                filteredPosts = filteredPosts.filter(post => {
                    if (!post.created_at) return true;
                    const postDate = new Date(post.created_at);
                    return postDate >= filterStartDate;
                });
            }
        }


        filteredPosts.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            
            if (newSortOrder === 'asc') {
                return dateA - dateB; 
            } else {
                return dateB - dateA;
            }
        });

        onFilteredPostsChange(filteredPosts);
    };

    const handleSortChange = (e) => {
        const newSortOrder = e.target.value;
        setSortOrder(newSortOrder);
        applyFilters(newSortOrder, dateFilter, startDate, endDate);
    };

    const handleDateFilterChange = (e) => {
        const newDateFilter = e.target.value;
        setDateFilter(newDateFilter);
        

        if (newDateFilter !== 'custom') {
            setStartDate('');
            setEndDate('');
        }
        
        applyFilters(sortOrder, newDateFilter, startDate, endDate);
    };

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        applyFilters(sortOrder, dateFilter, newStartDate, endDate);
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        applyFilters(sortOrder, dateFilter, startDate, newEndDate);
    };

    const handleClearFilters = () => {
        setSortOrder('desc');
        setDateFilter('all');
        setStartDate('');
        setEndDate('');
        applyFilters('desc', 'all', '', '');
    };

    const hasActiveFilters = sortOrder !== 'desc' || dateFilter !== 'all' || startDate || endDate;

    return (
        <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Sort by</span>
                <select
                    className={styles.filterSelect}
                    value={sortOrder}
                    onChange={handleSortChange}
                >
                    <option value="desc">Newest</option>
                    <option value="asc">Oldest</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Posted</span>
                <select
                    className={styles.filterSelect}
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                </select>
            </div>

            {dateFilter === 'custom' && (
                <>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>From</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={startDate}
                            onChange={handleStartDateChange}
                            max={endDate || undefined}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>To</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={endDate}
                            onChange={handleEndDateChange}
                            min={startDate || undefined}
                        />
                    </div>
                </>
            )}

            {hasActiveFilters && (
                <button
                    className={styles.clearButton}
                    onClick={handleClearFilters}
                    type="button"
                >
                    Clear
                </button>
            )}
        </div>
    );
}