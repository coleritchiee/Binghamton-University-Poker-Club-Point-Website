import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Leaderboard from './leaderboard'
import WeeklyMeetings from './weekly-meetings'
import Tournaments from './tournaments'

export default function PokerClubTabs() {
  return (
    <Tabs defaultValue="leaderboard" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="leaderboard" className="px-2 py-1.5">Leaderboard</TabsTrigger>
        <TabsTrigger value="weekly-meetings" className="px-2 py-1.5">Weekly Meetings</TabsTrigger>
        <TabsTrigger value="tournaments" className="px-2 py-1.5">Tournaments</TabsTrigger>
      </TabsList>
      <TabsContent value="leaderboard">
        <Leaderboard />
      </TabsContent>
      <TabsContent value="weekly-meetings">
        <WeeklyMeetings />
      </TabsContent>
      <TabsContent value="tournaments">
        <Tournaments />
      </TabsContent>
    </Tabs>
  )
}