import { getLeaderboardData } from '../firebase/firebase';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LeaderboardEntry } from '../types';

export default async function Leaderboard() {
  const leaderboardData: LeaderboardEntry[] = await getLeaderboardData();

  if (leaderboardData.length === 0) {
    return <div>No leaderboard data available.</div>;
  }

  return (
    <Table>
      <TableCaption>Current Poker Club Rankings</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboardData.map((entry) => (
          <TableRow key={entry.rank}>
            <TableCell className="font-medium">{entry.rank}</TableCell>
            <TableCell>{entry.name}</TableCell>
            <TableCell className="text-right">{entry.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}