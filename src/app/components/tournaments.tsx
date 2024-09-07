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

export default async function Tournaments() {
  try {
    const allTournaments: Tournament[] = await getTournaments();
    const nonActiveTournaments = allTournaments.filter(tournament => !tournament.isActive);

    if (nonActiveTournaments.length === 0) {
      return <div className="text-center p-4">No completed tournaments available.</div>;
    }

    const sortedTournaments = [...nonActiveTournaments].sort((a, b) => a.name.localeCompare(b.name));

    return (
      <Tabs defaultValue={sortedTournaments[0]?.id}>
        <TabsList className="mb-4">
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
    return <div className="text-center p-4 text-destructive">Failed to load tournaments data. Please try again later.</div>;
  }
}