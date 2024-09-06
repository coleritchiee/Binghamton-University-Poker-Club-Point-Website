import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Meeting } from '../types'

type WeeklyMeetingDetailsDialogProps = {
  meeting: Meeting | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WeeklyMeetingDetailsDialog({
  meeting,
  isOpen,
  onOpenChange
}: WeeklyMeetingDetailsDialogProps) {
  if (!meeting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{meeting.name} Details</DialogTitle>
        </DialogHeader>
        <Button className="mb-4">
          <span className="mr-2">+</span> Add Result
        </Button>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Knockouts</TableHead>
                <TableHead>Hour Game</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meeting.results.map((result) => (
                <TableRow key={result.rank}>
                  <TableCell>{result.rank}</TableCell>
                  <TableCell>{result.name}</TableCell>
                  <TableCell>{result.knockouts}</TableCell>
                  <TableCell>{result.hourGame ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">{result.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}