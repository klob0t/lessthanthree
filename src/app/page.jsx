import dynamic from 'next/dynamic'
import { Scene } from './components/Rose/Index'

export default function Home() {
    return (
        <main>
            <div >
                <Scene />
            </div>
        </main>
    )
}