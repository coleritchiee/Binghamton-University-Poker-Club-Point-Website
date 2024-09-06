import { getTournamentsData } from '../firebase/firebase';
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

export default async function Tournaments() {
  try {
    const tournaments: Tournament[] = await getTournamentsData();

    if (tournaments.length === 0) {
      return <div>No tournaments data available.</div>;
    }

    // Sort tournaments alphabetically by name
    const sortedTournaments = [...tournaments].sort((a, b) => a.name.localeCompare(b.name));

    return (
      <Tabs defaultValue={sortedTournaments[0]?.id}>
        <TabsList>
          {sortedTournaments.map((tournament) => (
            <TabsTrigger key={tournament.id} value={tournament.id}>
              {tournament.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {sortedTournaments.map((tournament) => (
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
                {tournament.results.map((result: TournamentResult) => (
                  <TableRow key={result.rank}>
                    <TableCell className="font-medium">{result.rank}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell className="text-right">{result.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    );
  } catch (error) {
    console.error("Error in Tournaments component:", error);
    return <div>Failed to load tournaments data. Please try again later.</div>;
  }
}