'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export default function WeeklyMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const fetchedMeetings = await getMeetingsData();
        const sortedMeetings = fetchedMeetings.map(meeting => ({
          ...meeting,
          results: [...meeting.results].sort((a, b) => b.points - a.points)
        })).sort((a, b) => {
          const dateA = new Date(new Date().getFullYear(), parseInt(a.name.split('/')[0]) - 1, parseInt(a.name.split('/')[1]));
          const dateB = new Date(new Date().getFullYear(), parseInt(b.name.split('/')[0]) - 1, parseInt(b.name.split('/')[1]));
          return dateB.getTime() - dateA.getTime();
        });
        setMeetings(sortedMeetings);
      } catch (err) {
        console.error("Error fetching meetings:", err);
        setError("Failed to load weekly meetings data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4 text-muted-foreground">Loading weekly meetings data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-destructive">{error}</div>;
  }

  if (meetings.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No weekly meetings data available.</div>;
  }

  return (
    <Tabs defaultValue={meetings[0]?.id} className="text-foreground">
      <TabsList className="mb-4 flex flex-wrap bg-muted">
        {meetings.map((meeting) => (
          <TabsTrigger key={meeting.id} value={meeting.id} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            {meeting.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {meetings.map((meeting) => (
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
              {meeting.results.map((result: MeetingResult, index) => (
                <motion.tr
                  key={result.name}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-b border-muted"
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{result.name}</TableCell>
                  <TableCell>{result.knockouts}</TableCell>
                  <TableCell>{result.hourGame ? 'Yes' : 'No'}</TableCell>
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