'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './page.module.css'
import Masonry from 'react-layout-masonry';
import gsap from 'gsap'
import { utils } from 'gsap'

export default function FileList() {
   const [files, setFiles] = useState([])
   const [loading, setLoading] = useState(true)
   const containerRef = useRef(null);

   useEffect(() => {
      fetch('/api/files')
         .then(response => response.json())
         .then(data => {
            if (Array.isArray(data)) {
               setFiles(data);
            }
            setLoading(false);
         })
         .catch(error => {
            console.error('Error:', error);
            setLoading(false);
         });
   }, []);

useEffect(() => {
   if (!loading && containerRef.current) {
      const images = Array.from(containerRef.current.querySelectorAll('img'));
      const shuffledImages = gsap.utils.shuffle([...images]);

      gsap.fromTo(shuffledImages,
         { opacity: 0 },
         {
            opacity: 0.5,
            duration: 2,
            stagger: 0.1,
            ease: 'power2.out'
         }
      );
   }
}, [loading, files]);

   return (
      <main style={{
         display: 'block',
         overflow: 'hidden',
         scale: '1.2',
      }} ref={containerRef}>
         <Masonry columns={9} gap={4}>
            {[...files, ...files].map((file, i) => {
               return (
                  <div
                     key={i}
                     style={{
                        width: '200px',
                        filter: 'grayscale(100%)',
                        display: 'block',
                        width: '100px',
                        height: `${100 / file.ratio}px`,
                     }}>
                     <Image
                        priority={true}
                        src={file.path}
                        style={{ display: 'block', opacity: 0 }}
                        fill={true}
                        alt={`Image ${i}`}
                     />
                  </div>
               )
            })}
         </Masonry>
      </main>
   )
}