import { useState, useEffect, useRef } from 'react';

export const useStickyElement = (triggerOffset = 80) => {
  const [isSticky, setIsSticky] = useState(false);
  const elementRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current && triggerRef.current) {
        const triggerBottom = triggerRef.current.getBoundingClientRect().bottom;
        setIsSticky(triggerBottom <= triggerOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerOffset]);

  return { isSticky, elementRef, triggerRef };
};