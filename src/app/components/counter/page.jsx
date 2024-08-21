import styles from '@/app/components/counter/page.module.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
// import useGSAP from '@gsap/react'

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
  const counter = useRef(null);

  gsap.to(counting.current, {
    duration: 4,
    textContent: endValue,
    roundProps: "textContent",
    ease: "power4.inOut",
  })
    gsap.to(counter.current, {
    duration: 4,
    ease: "power4.inOut",
    stagger: 1
  })

  return (
    <div  ref={counter} className={styles.counter}>
      <h1>It has been<div style={{ fontSize: "2em" }} ref={counting}>0</div>days since we are together</h1>
    </div>
  );
}

export default Counter;