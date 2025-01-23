'use client'

import { motion } from 'framer-motion';
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

type TournamentsProps = {
  data: Tournament[];
}

export default function Champions({ data }: TournamentsProps) {
  if (data.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No champion information available.</div>;
  }

  return (
    <Tabs defaultValue={data[0]?.id} className="text-foreground">
       <div className="overflow-x-auto flex justify-center">
      <TabsList className="mb-4 inline-flex bg-muted whitespace-nowrap">
        {data.map((tournament) => (
          <TabsTrigger key={tournament.id} value={tournament.id} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            {tournament.name}
          </TabsTrigger>
        ))}
      </TabsList>
      </div>
      {data.map((tournament) => (
        <TabsContent key={tournament.id} value={tournament.id}>
          <Table>
            <TableCaption>{tournament.name} Champion Results</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Rank</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournament.results.map((result: TournamentResult, index) => (
                <motion.tr
                  key={result.rank}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.015 }}
                  className="border-b border-muted"
                >
                  <TableCell className="font-medium">{result.rank}</TableCell>
                  <TableCell>{result.name + " " + (result.rank === 1 ? "👑" : result.rank === 2 ? "🥈" : result.rank === 3 ? "🥉" : "")}</TableCell>
                 
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      ))}
    </Tabs>
  );
}