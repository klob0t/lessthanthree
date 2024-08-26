import dynamic from 'next/dynamic'
import Counter from '../counter/page'
import Photos from '../photos/page'


export default function PhotosCounter() {
   return (
      <div
         style={{
            display: 'block'
         }}>
         <Counter
            style={{
               position: 'absolute'
            }} />
         <Photos style={{
               position: 'absolute'
            }} />
      </div>
   )
}
