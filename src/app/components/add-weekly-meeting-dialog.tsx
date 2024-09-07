'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addWeeklyMeeting } from '../firebase/firebase'

type AddWeeklyMeetingDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddWeeklyMeetingDialog({ isOpen, onOpenChange, onSuccess }: AddWeeklyMeetingDialogProps) {
  const [date, setDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!isValidDate(date)) {
      setError("Invalid date format. Please use MM/DD with no leading zeros.")
      setIsLoading(false)
      return
    }

    try {
      await addWeeklyMeeting(date)
      onSuccess()
      onOpenChange(false)
      setDate('')
    } catch (err) {
      console.error("Error adding weekly meeting:", err)
      setError("Failed to add weekly meeting. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isValidDate = (input: string): boolean => {
    const regex = /^(1[0-2]|[1-9])\/(3[01]|[12][0-9]|[1-9])$/
    if (!regex.test(input)) return false

    const [month, day] = input.split('/').map(Number)
    const currentYear = new Date().getFullYear()
    const date = new Date(currentYear, month - 1, day)

    return date.getMonth() === month - 1 && date.getDate() === day
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Add New Weekly Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meeting-date" className="text-right">
              Date
            </Label>
            <Input
              id="meeting-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="MM/DD (no leading zeros)"
              className="col-span-3"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isLoading || !date.trim()}>
            {isLoading ? 'Adding...' : 'Confirm'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}