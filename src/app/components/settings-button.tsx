'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from 'lucide-react'
import EditDialog from './edit-dialog'
import PlayersListDialog from './players-list-dialog'
import ActiveTournamentsDialog from './active-tournaments-dialog'

export default function SettingsButton() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false)
  const [isPlayersListDialogOpen, setIsPlayersListDialogOpen] = useState(false)
  const [isActiveTournamentsDialogOpen, setIsActiveTournamentsDialogOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsPasswordDialogOpen(false)
      setIsEditDialogOpen(true)
      setPassword('')
      setError('')
    } else if (password === process.env.NEXT_PUBLIC_PLAYER_PASSWORD) {
      setIsPasswordDialogOpen(false)
      setIsSelectionDialogOpen(true)
      setPassword('')
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  const handleSelection = (selection: 'players' | 'tournaments') => {
    setIsSelectionDialogOpen(false)
    if (selection === 'players') {
      setIsPlayersListDialogOpen(true)
    } else {
      setIsActiveTournamentsDialogOpen(true)
    }
  }

  return (
    <>
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="fixed bottom-4 right-4 rounded-full"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Enter the password to access settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSelectionDialogOpen} onOpenChange={setIsSelectionDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Select View</DialogTitle>
            <DialogDescription>
              Choose what you'd like to view.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 py-4">
            <Button onClick={() => handleSelection('players')}>
              Player List
            </Button>
            <Button onClick={() => handleSelection('tournaments')}>
              Active Tournaments
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <PlayersListDialog
        isOpen={isPlayersListDialogOpen}
        onOpenChange={setIsPlayersListDialogOpen}
      />

      <ActiveTournamentsDialog
        isOpen={isActiveTournamentsDialogOpen}
        onOpenChange={setIsActiveTournamentsDialogOpen}
      />
    </>
  )
}