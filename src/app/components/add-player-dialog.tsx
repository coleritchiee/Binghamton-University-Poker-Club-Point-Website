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
import { addPlayer } from '../firebase/firebase'

type AddPlayerDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddPlayerDialog({ isOpen, onOpenChange, onSuccess }: AddPlayerDialogProps) {
  const [playerName, setPlayerName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await addPlayer(playerName)
      onSuccess()
      onOpenChange(false)
      setPlayerName('')
    } catch (err) {
      console.error("Error adding player:", err)
      setError(""+err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player-name" className="text-right">
              Name
            </Label>
            <Input
              id="player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isLoading || !playerName.trim()}>
            {isLoading ? 'Adding...' : 'Confirm'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}