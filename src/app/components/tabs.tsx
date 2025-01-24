"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Leaderboard from "./leaderboard"
import WeeklyMeetings from "./weekly-meetings"
import Tournaments from "./tournaments"
import Champions from "./champions"
import { getLeaderboardData, getMeetingsData, getTournaments, getChamps } from "../firebase/firebase"
import type { LeaderboardEntry, Meeting, Tournament } from "../types"

export default function PokerClubTabs() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [champs, setChamps] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [leaderboard, meetingsData, tournamentsData, champsData] = await Promise.all([
          getLeaderboardData(),
          getMeetingsData(),
          getTournaments(),
          getChamps(),
        ])

        setLeaderboardData(leaderboard)

        const sortedMeetings = meetingsData
          .map((meeting) => ({
            ...meeting,
            results: [...meeting.results].sort((a, b) => b.points - a.points),
          }))
          .sort((a, b) => {
            const dateA = new Date(
              new Date().getFullYear(),
              Number.parseInt(a.name.split("/")[0]) - 1,
              Number.parseInt(a.name.split("/")[1]),
            )
            const dateB = new Date(
              new Date().getFullYear(),
              Number.parseInt(b.name.split("/")[0]) - 1,
              Number.parseInt(b.name.split("/")[1]),
            )
            return dateB.getTime() - dateA.getTime()
          })
        setMeetings(sortedMeetings)

        const nonActiveTournaments = tournamentsData.filter((tournament) => !tournament.isActive)
        const sortedTournaments = [...nonActiveTournaments].sort((a, b) => {
          const dateA = new Date(
            new Date().getFullYear(),
            Number.parseInt(a.name.split("/")[0]) - 1,
            Number.parseInt(a.name.split("/")[1]),
          )
          const dateB = new Date(
            new Date().getFullYear(),
            Number.parseInt(b.name.split("/")[0]) - 1,
            Number.parseInt(b.name.split("/")[1]),
          )
          return dateB.getTime() - dateA.getTime()
        })
        setTournaments(sortedTournaments)

        const sortedChamps = champsData.sort((a, b) => {
          const [seasonA, yearA] = a.name.split(" ")
          const [seasonB, yearB] = b.name.split(" ")

          if (yearA !== yearB) {
            return Number.parseInt(yearB) - Number.parseInt(yearA)
          }

          if (seasonA === seasonB) {
            return 0
          }

          if (seasonA === "Spring") {
            return 1
          }

          return -1
        })

        setChamps(sortedChamps)

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
      <TabsList className="grid grid-cols-2 sm:flex sm:flex-row w-full bg-muted py-0.5 px-0.5 h-auto">
        <TabsTrigger
          value="leaderboard"
          className="flex items-center justify-center h-12 px-2 text-sm sm:text-xs md:text-sm lg:text-base whitespace-nowrap overflow-hidden text-ellipsis sm:flex-1"
        >
          Leaderboard
        </TabsTrigger>
        <TabsTrigger
          value="weekly-meetings"
          className="flex items-center justify-center h-12 px-2 text-sm sm:text-xs md:text-sm lg:text-base whitespace-nowrap overflow-hidden text-ellipsis sm:flex-1"
        >
          Weekly Meetings
        </TabsTrigger>
        <TabsTrigger
          value="tournaments"
          className="flex items-center justify-center h-12 px-2 text-sm sm:text-xs md:text-sm lg:text-base whitespace-nowrap overflow-hidden text-ellipsis sm:flex-1"
        >
          Tournaments
        </TabsTrigger>
        <TabsTrigger
          value="champions"
          className="flex items-center justify-center h-12 px-2 text-sm sm:text-xs md:text-sm lg:text-base whitespace-nowrap overflow-hidden text-ellipsis sm:flex-1"
        >
          Champions
        </TabsTrigger>
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
      <TabsContent value="champions">
        <Champions data={champs} />
      </TabsContent>
    </Tabs>
  )
}

