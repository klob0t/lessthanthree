import styles from './hero.module.css'
import { EmojiProvider, Emoji } from "react-apple-emojis"
import emojiData from "react-apple-emojis/src/data.json"

export default function Hero() {
   return (
      <div className={styles.heroPage}>
         <p><span>H</span>ai
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