import styles from '@/app/components/counter/page.module.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

function DaysPassed() {
  const pastDate = new Date('2022-08-27'); // Corrected date format
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

  return daysPassed; // Return the calculated days
}

function Counter() {
  const [count, setCount] = useState(0);
  const endValue = DaysPassed();
  const counting = useRef(null);

  gsap.to(counting.current, {
    duration: 4,
    textContent: endValue,
    roundProps: "textContent",
    ease: "power4.inOut",
  })

  return (
    <div className={styles.counter}>
      <h1>It has been<br/> <span style={{ fontSize: "1.5em" }} ref={counting}>0</span><br/>days since we are together</h1>
    </div>
  );
}

export default Counter;