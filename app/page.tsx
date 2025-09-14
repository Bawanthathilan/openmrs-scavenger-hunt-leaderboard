import { ScavengerHuntLeaderboard } from "@/components/scavenger-hunt-leaderboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <ScavengerHuntLeaderboard />
      </div>
    </main>
  )
}
