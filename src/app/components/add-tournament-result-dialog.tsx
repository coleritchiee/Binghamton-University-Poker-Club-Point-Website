'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addTournamentResult } from '../firebase/firebase'
import { PlayerAutocomplete } from './player-autocomplete'
import { Player } from '../types'
import { toast } from "@/hooks/use-toast"

type AddTournamentResultDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  tournamentType: string;
  onResultAdded: () => void;
}

export default function AddTournamentResultDialog({
  isOpen,
  onOpenChange,
  tournamentId,
  tournamentType,
  onResultAdded
}: AddTournamentResultDialogProps) {
  const [name, setName] = useState('')
  const [knockouts, setKnockouts] = useState(0)
  const [rank, setRank] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    setIsAdding(true)
    setError(null)
    try {
      await addTournamentResult(tournamentId, {
        name,
        knockouts: tournamentType === 'PKO' ? knockouts : 0,
        points: 0,
        rank
      })
      onResultAdded()
      toast({
        title: "Result Added",
        description: `${name}'s result has been added to the tournament.`,
      })
      onOpenChange(false)
    } catch (err) {
      console.error("Error adding result:", err)
      setError("Failed to add result. Please try again.")
      toast({
        title: "Error",
        description: "Failed to add result. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handlePlayerSelect = (player: Player) => {
    setName(player.name)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Add Tournament Result</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3 w-full">
              <PlayerAutocomplete
                onSelect={handlePlayerSelect}
              />
            </div>
          </div>
          {tournamentType === 'PKO' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="knockouts" className="text-right">
                Knockouts
              </Label>
              <Input
                id="knockouts"
                type="number"
                value={knockouts}
                onChange={(e) => setKnockouts(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rank" className="text-right">
              Rank
            </Label>
            <Input
              id="rank"
              type="number"
              value={rank}
              onChange={(e) => setRank(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <DialogFooter>
          <Button onClick={handleAdd} disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Result'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}