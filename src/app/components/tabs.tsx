'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Leaderboard from './leaderboard'
import WeeklyMeetings from './weekly-meetings'
import Tournaments from './tournaments'
import { getLeaderboardData, getMeetingsData, getTournaments } from '../firebase/firebase'
import { LeaderboardEntry, Meeting, Tournament } from '../types'

export default function PokerClubTabs() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [leaderboard, meetingsData, tournamentsData] = await Promise.all([
          getLeaderboardData(),
          getMeetingsData(),
          getTournaments()
        ])

        setLeaderboardData(leaderboard)

        const sortedMeetings = meetingsData.map(meeting => ({
          ...meeting,
          results: [...meeting.results].sort((a, b) => b.points - a.points)
        })).sort((a, b) => {
          const dateA = new Date(new Date().getFullYear(), parseInt(a.name.split('/')[0]) - 1, parseInt(a.name.split('/')[1]))
          const dateB = new Date(new Date().getFullYear(), parseInt(b.name.split('/')[0]) - 1, parseInt(b.name.split('/')[1]))
          return dateB.getTime() - dateA.getTime()
        })
        setMeetings(sortedMeetings)

        const nonActiveTournaments = tournamentsData.filter(tournament => !tournament.isActive)
        const sortedTournaments = [...nonActiveTournaments].sort((a, b) => {
          const dateA = new Date(new Date().getFullYear(), parseInt(a.name.split('/')[0]) - 1, parseInt(a.name.split('/')[1]))
          const dateB = new Date(new Date().getFullYear(), parseInt(b.name.split('/')[0]) - 1, parseInt(b.name.split('/')[1]))
          return dateB.getTime() - dateA.getTime()
        })
        setTournaments(sortedTournaments)

        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  if (isLoading) {
    return <div className="text-center p-4 text-muted-foreground">Loading data...</div>
  }

  if (error) {
    return <div className="text-center p-4 text-destructive">{error}</div>
  }

  return (
    <Tabs defaultValue="leaderboard" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="leaderboard" className="px-4 py-1.5">Leaderboard</TabsTrigger>
        <TabsTrigger value="weekly-meetings" className="px-4 py-1.5">Weekly Meetings</TabsTrigger>
        <TabsTrigger value="tournaments" className="px-4 py-1.5">Tournaments</TabsTrigger>
      </TabsList>
      <TabsContent value="leaderboard">
        <Leaderboard data={leaderboardData} />
      </TabsContent>
      <TabsContent value="weekly-meetings">
        <WeeklyMeetings data={meetings} />
      </TabsContent>
      <TabsContent value="tournaments">
        <Tournaments data={tournaments} />
      </TabsContent>
    </Tabs>
  )
}