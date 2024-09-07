'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SelectItemDialog from './select-item-dialog'
import SelectTournamentItemDialog from './select-tournament-item-dialog'
import PlayersListDialog from './players-list-dialog'
import { getMeetingsData, getTournaments, updateLeaderboard } from '../firebase/firebase'
import { Meeting, Tournament } from '../types'
import { toast } from "@/hooks/use-toast"

type EditDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDialog({ isOpen, onOpenChange }: EditDialogProps) {
  const [selectedOption, setSelectedOption] = useState<'weekly-meetings' | 'tournaments' | 'players' | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async (option: 'weekly-meetings' | 'tournaments') => {
    setIsLoading(true)
    setError(null)
    try {
      if (option === 'weekly-meetings') {
        const fetchedMeetings = await getMeetingsData()
        setMeetings(fetchedMeetings)
      } else if (option === 'tournaments') {
        const fetchedTournaments = await getTournaments()
        setTournaments(fetchedTournaments)
      }
    } catch (err) {
      console.error(`Error fetching ${option}:`, err)
      setError(`Failed to load ${option}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (option: 'weekly-meetings' | 'tournaments' | 'players') => {
    setSelectedOption(option)
    if (option === 'weekly-meetings' || option === 'tournaments') {
      await fetchItems(option)
    }
  }

  const handleRefresh = async () => {
    if (selectedOption === 'weekly-meetings' || selectedOption === 'tournaments') {
      await fetchItems(selectedOption)
    }
  }

  const handleUpdateLeaderboard = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await updateLeaderboard()
      toast({
        title: "Leaderboard Updated",
        description: "The leaderboard has been successfully updated.",
      })
    } catch (err) {
      console.error("Error updating leaderboard:", err)
      setError("Failed to update leaderboard. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update leaderboard. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Edit Options</DialogTitle>
            <DialogDescription>
              Choose what you want to edit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={() => handleEdit('weekly-meetings')}>
              Edit Weekly Meetings
            </Button>
            <Button onClick={() => handleEdit('tournaments')}>
              Edit Tournaments
            </Button>
            <Button onClick={() => handleEdit('players')}>
              Players List
            </Button>
            <Button onClick={handleUpdateLeaderboard} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Leaderboard'}
            </Button>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </DialogContent>
      </Dialog>

      {selectedOption === 'players' && (
        <PlayersListDialog
          isOpen={selectedOption === 'players'}
          onOpenChange={(open) => !open && setSelectedOption(null)}
        />
      )}

      {selectedOption === 'weekly-meetings' && (
        <SelectItemDialog
          isOpen={selectedOption === 'weekly-meetings'}
          onOpenChange={(open) => !open && setSelectedOption(null)}
          title="Select a Meeting"
          items={meetings}
          onSelectItem={(item)=>{}}
          onCreateNew={()=>{}}
          itemType="weekly-meetings"
          onRefresh={handleRefresh}
        />
      )}

      {selectedOption === 'tournaments' && (
        <SelectTournamentItemDialog
          isOpen={selectedOption === 'tournaments'}
          onOpenChange={(open) => !open && setSelectedOption(null)}
          tournaments={tournaments}
          onRefresh={handleRefresh}
        />
      )}
    </>
  )
}