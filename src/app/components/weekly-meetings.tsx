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
import { Meeting, MeetingResult } from '../types';

type WeeklyMeetingsProps = {
  data: Meeting[];
}

export default function WeeklyMeetings({ data }: WeeklyMeetingsProps) {
  if (data.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No weekly meetings data available.</div>;
  }

  return (
    <Tabs defaultValue={data[0]?.id} className="text-foreground">
      <TabsList className="mb-4 flex flex-wrap bg-muted">
        {data.map((meeting) => (
          <TabsTrigger key={meeting.id} value={meeting.id} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            {meeting.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {data.map((meeting) => (
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
                  transition={{ duration: 0.2, delay: index * 0.015 }}
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