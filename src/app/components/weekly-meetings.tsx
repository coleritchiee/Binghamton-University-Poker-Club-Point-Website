import { getMeetingsData } from '../firebase/firebase';
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
import { Meeting, MeetingResult } from '../types';

export default async function WeeklyMeetings() {
  try {
    const meetings: Meeting[] = await getMeetingsData();
    console.log("Fetched meetings:", meetings);

    if (meetings.length === 0) {
      return <div>No weekly meetings data available.</div>;
    }

    // Sort meetings alphabetically by name
    const sortedMeetings = [...meetings].sort((a, b) => a.name.localeCompare(b.name));

    return (
      <Tabs defaultValue={sortedMeetings[0]?.id}>
        <TabsList>
          {sortedMeetings.map((meeting) => (
            <TabsTrigger key={meeting.id} value={meeting.id}>
              {meeting.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {sortedMeetings.map((meeting) => (
          <TabsContent key={meeting.id} value={meeting.id}>
            <Table>
              <TableCaption>{meeting.name} Results</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Knockouts</TableHead>
                  <TableHead>Hour Game?</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meeting.results.map((result: MeetingResult) => (
                  <TableRow key={result.rank}>
                    <TableCell className="font-medium">{result.rank}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell>{result.knockouts}</TableCell>
                    <TableCell>{result.hourGame ? 'Yes' : 'No'}</TableCell>
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
    console.error("Error in WeeklyMeetings component:", error);
    return <div>Failed to load weekly meetings data. Please try again later.</div>;
  }
}