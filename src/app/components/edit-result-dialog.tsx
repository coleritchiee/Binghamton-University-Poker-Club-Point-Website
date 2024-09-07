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
import { TournamentResult, Player } from '../types'
import { updateTournamentResult } from '../firebase/firebase'
import { PlayerAutocomplete } from './player-autocomplete'

type EditResultDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: TournamentResult;
  tournamentId: string;
  tournamentType: string;
  onResultUpdated: () => void;
}

export default function EditResultDialog({
  isOpen,
  onOpenChange,
  result,
  tournamentId,
  tournamentType,
  onResultUpdated
}: EditResultDialogProps) {
  const [name, setName] = useState(result.name)
  const [knockouts, setKnockouts] = useState(result.knockouts || 0)
  const [points, setPoints] = useState(result.points)
  const [rank, setRank] = useState(result.rank)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async () => {
    setIsUpdating(true)
    setError(null)
    try {
      await updateTournamentResult(tournamentId, {
        name,
        knockouts: tournamentType === 'PKO' ? knockouts : 0,
        points,
        rank
      })
      onResultUpdated()
    } catch (err) {
      console.error("Error updating result:", err)
      setError("Failed to update result. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePlayerSelect = (player: Player) => {
    setName(player.name)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Edit Result</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3">
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
            <Label htmlFor="points" className="text-right">
              Points
            </Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
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
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Result'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}