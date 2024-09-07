'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTournaments } from '../firebase/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tournament, TournamentResult } from '../types';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const allTournaments = await getTournaments();
        const nonActiveTournaments = allTournaments.filter(tournament => !tournament.isActive);
        const sortedTournaments = [...nonActiveTournaments].sort((a, b) => {
          const dateA = new Date(new Date().getFullYear(), parseInt(a.name.split('/')[0]) - 1, parseInt(a.name.split('/')[1]));
          const dateB = new Date(new Date().getFullYear(), parseInt(b.name.split('/')[0]) - 1, parseInt(b.name.split('/')[1]));
          return dateB.getTime() - dateA.getTime();
        });
        setTournaments(sortedTournaments);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
        setError("Failed to load tournaments data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4 text-muted-foreground">Loading tournaments data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-destructive">{error}</div>;
  }

  if (tournaments.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No completed tournaments available.</div>;
  }

  return (
    <Tabs defaultValue={tournaments[0]?.id} className="text-foreground">
      <TabsList className="mb-4 flex flex-wrap bg-muted">
        {tournaments.map((tournament) => (
          <TabsTrigger key={tournament.id} value={tournament.id} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            {tournament.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tournaments.map((tournament) => (
        <TabsContent key={tournament.id} value={tournament.id}>
          <Table>
            <TableCaption>{tournament.name} Results</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournament.results.map((result: TournamentResult, index) => (
                <motion.tr
                  key={result.rank}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-b border-muted"
                >
                  <TableCell className="font-medium">{result.rank}</TableCell>
                  <TableCell>{result.name}</TableCell>
                  <TableCell className="text-right">{result.points}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      ))}
    </Tabs>
  );
}