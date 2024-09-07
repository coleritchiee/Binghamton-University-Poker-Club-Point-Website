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
import { Checkbox } from "@/components/ui/checkbox"
import { PlayerAutocomplete } from './player-autocomplete'
import { addResult } from '../firebase/firebase'

type AddResultDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  meetingId: string;
}

export default function AddResultDialog({ isOpen, onOpenChange, onSuccess, meetingId }: AddResultDialogProps) {
  const [playerId, setPlayerId] = useState('')
  const [rank, setRank] = useState('')
  const [knockouts, setKnockouts] = useState('')
  const [isHourGame, setIsHourGame] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!playerId || !rank || !knockouts) {
      setError("Please fill in all fields.")
      setIsLoading(false)
      return
    }

    const rankNum = parseInt(rank)
    const knockoutsNum = parseInt(knockouts)

    if (isNaN(rankNum) || isNaN(knockoutsNum)) {
      setError("Rank and knockouts must be numbers.")
      setIsLoading(false)
      return
    }

    try {
      await addResult(meetingId, {
        playerId,
        rank: rankNum,
        knockouts: knockoutsNum,
        hourGame: isHourGame
      })
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err) {
      console.error("Error adding result:", err)
      setError("Failed to add result. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPlayerId('')
    setRank('')
    setKnockouts('')
    setIsHourGame(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Add New Result</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player" className="text-right">
              Player
            </Label>
            <div className="col-span-3">
              <PlayerAutocomplete onSelect={setPlayerId} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rank" className="text-right">
              Rank
            </Label>
            <Input
              id="rank"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="col-span-3"
              type="number"
              min="1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="knockouts" className="text-right">
              Knockouts
            </Label>
            <Input
              id="knockouts"
              value={knockouts}
              onChange={(e) => setKnockouts(e.target.value)}
              className="col-span-3"
              type="number"
              min="0"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hour-game"
              checked={isHourGame}
              onCheckedChange={(checked) => setIsHourGame(checked as boolean)}
            />
            <Label htmlFor="hour-game">Hour Game</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Result'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}