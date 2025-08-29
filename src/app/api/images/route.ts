import path from "path"
import { promises as fs } from 'fs'
import { NextResponse } from "next/server"

export async function GET() {
   try {
      const folder = path.join(process.cwd(), 'public', 'images')
      const filenames = await fs.readdir(folder)

      const images = filenames
         .filter((file: string) => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file))
         .map((file: string) => `/images/${file}`)
      return NextResponse.json(images)
   } catch (error) {
      console.error('Failed to read images: ', error)

      return new NextResponse(
         JSON.stringify({ message: 'Internal Server Error: Could no load images' }), { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
   }
}