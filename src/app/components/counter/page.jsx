import styles from '@/app/components/counter/page.module.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

function DaysPassed() {
  const pastDate = new Date('2022-08-27');
  const [daysPassed, setDaysPassed] = useState(0);

  const calculateDays = useCallback(() => {
    const currentDate = new Date();
    const timeDiff = currentDate - pastDate;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    setDaysPassed(days);
  }, [pastDate]);

  useEffect(() => {
    calculateDays();
  }, [calculateDays]);

  return daysPassed;
}

function Counter() {
  const endValue = DaysPassed();
  const counting = useRef(null);
  const counter = useRef(null);
  const textBefore = useRef(null);
  const textAfter = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Hide the text before and after initially
    gsap.set([textBefore.current, textAfter.current], { opacity: 0 });

    // Animate the counter
    tl.to(counting.current, {
      duration: 4,
      textContent: endValue,
      roundProps: "textContent",
      ease: "power4.inOut",
      opacity: 1,
    })
    // Fade in the text before and after
    .to([textBefore.current, textAfter.current], {
      duration: 1,
      opacity: 1,
      ease: "power2.inOut",
    });

  }, [endValue]);

  return (
    <div ref={counter} className={styles.counter}>
      <h1>
        <div ref={textBefore}>It has been </div>
        <div style={{ fontSize: "3em", display: "inline-block", opacity: 0 }} ref={counting}>0</div>
        <div ref={textAfter}> days since we are together...</div>
      </h1>
    </div>
  );
}

export default Counter;