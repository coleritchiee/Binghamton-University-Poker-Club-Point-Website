'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Meeting, MeetingResult } from '../types'
import { deleteMeeting, deleteResult, getMeetingById } from '../firebase/firebase'
import { Trash2, Plus } from 'lucide-react'
import AddResultDialog from './add-result-dialog'

type WeeklyMeetingDetailsDialogProps = {
  meeting: Meeting | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMeetingDeleted: () => void;
}

export default function WeeklyMeetingDetailsDialog({
  meeting,
  isOpen,
  onOpenChange,
  onMeetingDeleted
}: WeeklyMeetingDetailsDialogProps) {
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(meeting)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddResultDialogOpen, setIsAddResultDialogOpen] = useState(false)

  useEffect(() => {
    setCurrentMeeting(meeting)
  }, [meeting])

  if (!currentMeeting) return null;

  const handleDeleteMeeting = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await deleteMeeting(currentMeeting.id)
      onMeetingDeleted()
      onOpenChange(false)
    } catch (err) {
      console.error("Error deleting meeting:", err)
      setError("Failed to delete meeting. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteResult = async (result: MeetingResult) => {
    setError(null)
    try {
      await deleteResult(currentMeeting.id, result)
      refreshMeetingData()
    } catch (err) {
      console.error("Error deleting result:", err)
      setError("Failed to delete result. Please try again.")
    }
  }

  const refreshMeetingData = async () => {
    try {
      const updatedMeeting = await getMeetingById(currentMeeting.id)
      setCurrentMeeting(updatedMeeting)
    } catch (err) {
      console.error("Error refreshing meeting data:", err)
      setError("Failed to refresh meeting data. Please try again.")
    }
  }

  const handleAddResultSuccess = () => {
    refreshMeetingData()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>{currentMeeting.name} Details</DialogTitle>
          </DialogHeader>
          <Button onClick={() => setIsAddResultDialogOpen(true)} className="mb-4">
            <Plus className="mr-2 h-4 w-4" /> Add Result
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
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMeeting.results.map((result: MeetingResult, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{result.rank}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell>{result.knockouts}</TableCell>
                    <TableCell>{result.hourGame ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">{result.points}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResult(result)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteMeeting}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddResultDialog
        isOpen={isAddResultDialogOpen}
        onOpenChange={setIsAddResultDialogOpen}
        onSuccess={handleAddResultSuccess}
        meetingId={currentMeeting.id}
      />
    </>
  )
}