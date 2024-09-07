'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlayerAutocomplete } from './player-autocomplete'
import { Plus } from 'lucide-react'
import AddPlayerDialog from './add-player-dialog'

type PlayersListDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlayersListDialog({ isOpen, onOpenChange }: PlayersListDialogProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelectPlayer = (playerId: string) => {
    setSelectedPlayer(playerId)
    console.log("Selected player:", playerId)
  }

  const handleAddPlayerSuccess = () => {
    setRefreshKey(prevKey => prevKey + 1)
    console.log("Player added successfully")
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Players List</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <PlayerAutocomplete onSelect={handleSelectPlayer} key={refreshKey} />
            <Button onClick={() => setIsAddPlayerDialogOpen(true)} className="mt-2">
              <Plus className="mr-2 h-4 w-4" /> Add New Player
            </Button>
            {selectedPlayer && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Selected Player ID: {selectedPlayer}</h3>
                {}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AddPlayerDialog
        isOpen={isAddPlayerDialogOpen}
        onOpenChange={setIsAddPlayerDialogOpen}
        onSuccess={handleAddPlayerSuccess}
      />
    </>
  )
}