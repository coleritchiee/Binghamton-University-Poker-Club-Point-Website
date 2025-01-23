"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addChampResult } from "../firebase/firebase"
import { PlayerAutocomplete } from "./player-autocomplete"
import type { Player } from "../types"
import { toast } from "@/hooks/use-toast"

type AddChampResultDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tournamentId: string
  onResultAdded: () => void
}

export default function AddChampResultDialog({
  isOpen,
  onOpenChange,
  tournamentId,
  onResultAdded,
}: AddChampResultDialogProps) {
  const [name, setName] = useState("")
  const [rank, setRank] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    setIsAdding(true)
    setError(null)
    try {
      await addChampResult(tournamentId, {
        name,
        points: 0,
        rank,
        knockouts: 0
      })
      onResultAdded()
      toast({
        title: "Result Added",
        description: `${name}'s result has been added to the championship.`,
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
          <DialogTitle>Add Championship Result</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3 w-full">
              <PlayerAutocomplete onSelect={handlePlayerSelect} />
            </div>
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
          <Button onClick={handleAdd} disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Result"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

