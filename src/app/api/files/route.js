import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET() {
  const directoryPath = path.join(process.cwd(), 'public', 'images', 'ours');
  
  try {
   const files = fs.readdirSync(directoryPath)
   const fileDetailsPromises = files.map(async file => {
      const filePath = path.join(directoryPath, file)
      
      try{
         const metadata = await sharp(filePath).metadata()

         return {
            name: file,
            path: `/images/ours/${file}`,
            type: path.extname(file).toLowerCase(),
            width: metadata.width,
            height: metadata.height,
            ratio: metadata.width / metadata.height
         }
      } catch (error){
         console.error('Error:', error);
         return null
      }
   })

   const fileDetails = (await Promise.all(fileDetailsPromises)).filter(Boolean)

   return NextResponse.json(fileDetails)
  } catch (err) {
    return NextResponse.json({ error: 'Unable to scan directory' }, { status: 500 });
  }

}

   
  

//     const files = fs.readdirSync(directoryPath);
//     const fileDetails = files.map(file => ({
//       name: file,
//       path: `/images/ours/${file}`,
//       type: path.extname(file).toLowerCase()
//     }));
//     return NextResponse.json(fileDetails);
//   } catch (err) {
//     return NextResponse.json({ error: 'Unable to scan directory' }, { status: 500 });
//   }
// }