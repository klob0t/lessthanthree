import styles from './hero.module.css'
import { EmojiProvider, Emoji } from "react-apple-emojis"
import emojiData from "react-apple-emojis/src/data.json"

export default function Hero() {
   return (
      <div className={styles.heroPage}>
         <h1>Hai,
            <span>
               <EmojiProvider data={emojiData}>
                  <Emoji name='red-heart' />
               </EmojiProvider>
            </span>
         </h1>
         <div></div>
      </div>
   )
}