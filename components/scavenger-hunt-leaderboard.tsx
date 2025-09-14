"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardEntry {
  timestamp: string
  openmrsId: string
  taskId: number
}

interface ProcessedEntry {
  username: string
  points: number
  rank: number
}

export function ScavengerHuntLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<ProcessedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhbEn4Z2bPFnNkzt1WNe3Xh5I-bEPnntQvRStsiyqTebV7aMd3KNtjKUdHuS_MqCGhDN9tbwTnA56gNi2qlCJZD-caCohejJ_QNXBoCVuZNuh0Cyth_K_9OgPnYfShs8Ryb3O_b4MAeiy6oHn-Iosr6FDXhiB4J8HrI7U985gJnsEw3bOlSrx_uCSMyvESppYX-uzUTxiL8fvh6SLlhJ2OWBwHQnLm7k0NrmpMuml1YoUyLK92gj3NILlL0tF_eGMGBG5wIC42e_7QN1UtD2ID7kgy4WQ&lib=MHakeFYilqMV2Gs2s46ctyABx2wiTu6LV",
      )

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data")
      }

      const data: LeaderboardEntry[] = await response.json()

      const userTaskCount = new Map<string, number>()

      data.forEach((entry) => {
        const currentTaskCount = userTaskCount.get(entry.openmrsId) || 0
        userTaskCount.set(entry.openmrsId, currentTaskCount + 1)
      })

      // Convert to array and sort by points (descending)
      const sortedEntries = Array.from(userTaskCount.entries())
        .map(([username, taskCount]) => ({ username, points: taskCount * 10 }))
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))

      setLeaderboard(sortedEntries)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  const getAvatarUrl = (username: string) => {
    return `https://talk.openmrs.org/user_avatar/talk.openmrs.org/${username}/96/20415_2.png`
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Scavenger Hunt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Scavenger Hunt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive">Error: {error}</p>
            <button
              onClick={fetchLeaderboardData}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center mb-2">Scavenger Hunt</CardTitle>
        <p className="text-muted-foreground text-center">Current Leaderboard</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b font-semibold text-muted-foreground">
            <div>Rank</div>
            <div>Avatar</div>
            <div>Username</div>
            <div className="text-right">Points</div>
          </div>

          {/* Leaderboard entries */}
          {leaderboard.map((entry) => (
            <div
              key={entry.username}
              className={`grid grid-cols-4 gap-4 py-3 px-2 rounded-lg transition-colors ${
                entry.rank <= 3 ? "bg-muted/50" : "hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={getRankBadgeVariant(entry.rank)}
                  className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                >
                  {entry.rank}
                </Badge>
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex items-center">
                <img
                  src={getAvatarUrl(entry.username) || "/placeholder.svg"}
                  alt={`${entry.username}'s avatar`}
                  className="w-10 h-10 rounded-full border-2 border-border"
                  onError={(e) => {
                    // Fallback to a default avatar if the image fails to load
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${entry.username}&size=96&background=random`
                  }}
                />
              </div>
              <div className="flex items-center font-medium">{entry.username}</div>
              <div className="flex items-center justify-end font-bold text-lg">{entry.points}</div>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No participants yet</div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <button
            onClick={fetchLeaderboardData}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Refresh Leaderboard
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
