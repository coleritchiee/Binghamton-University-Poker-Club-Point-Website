'use client'

import { motion } from 'framer-motion';
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

type LeaderboardProps = {
  data: LeaderboardEntry[];
}

export default function Leaderboard({ data }: LeaderboardProps) {
  const getChampEmoji = (rank: number) => {
    if (rank >= 1 && rank <= 8) {
      return '✅';
    } else if (rank >= 9 && rank <= 24) {
      return '🛰️';
    } else {
      return '❌';
    }
  };

  if (data.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No leaderboard data available.</div>;
  }

  return (
    <Table className="text-foreground">
      <TableCaption>Current Poker Club Rankings</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-center">Champs</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((entry, index) => (
          <motion.tr
            key={entry.rank}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className="border-b border-muted"
          >
            <TableCell className="font-medium">{entry.rank}</TableCell>
            <TableCell>{entry.name}</TableCell>
            <TableCell className="text-center">
              <span role="img" aria-label={`Champ status for rank ${entry.rank}`}>
                {getChampEmoji(entry.rank)}
              </span>
            </TableCell>
            <TableCell className="text-right">{entry.points}</TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}