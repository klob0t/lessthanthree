import styles from './hero.module.css'

export default function Hero() {
   return (
      <div className={styles.heroPage}>
         <p><span>D</span>ear
         </p>
         <div>
            <p><span>M</span>uthia &nbsp;
               {/* <span>
                  <EmojiProvider data={emojiData}>
                     <Emoji name='red-heart' />
                  </EmojiProvider>
               </span> */}
               </p>
         </div>
      </div>
   )
}