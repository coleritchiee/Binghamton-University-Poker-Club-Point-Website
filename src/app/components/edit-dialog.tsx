'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SelectItemDialog from './select-item-dialog'
import { getMeetingsData, getTournamentsData } from '../firebase/firebase'
import { Meeting, Tournament } from '../types'

type EditDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDialog({ isOpen, onOpenChange }: EditDialogProps) {
  const [selectedOption, setSelectedOption] = useState<'weekly-meetings' | 'tournaments' | null>(null)
  const [items, setItems] = useState<Meeting[] | Tournament[]>([])

  const handleEdit = async (option: 'weekly-meetings' | 'tournaments') => {
    setSelectedOption(option)
    try {
      if (option === 'weekly-meetings') {
        const meetings = await getMeetingsData()
        setItems(meetings)
      } else {
        const tournaments = await getTournamentsData()
        setItems(tournaments)
      }
    } catch (error) {
      console.error(`Error fetching ${option}:`, error)
      // You might want to show an error message to the user here
    }
  }

  const handleSelectItem = (item: Meeting | Tournament) => {
    console.log(`Selected ${selectedOption === 'weekly-meetings' ? 'meeting' : 'tournament'}:`, item)
    // Here you would typically open another dialog to edit the selected item
    setSelectedOption(null)
  }

  const handleCreateNew = () => {
    console.log(`Creating new ${selectedOption === 'weekly-meetings' ? 'meeting' : 'tournament'}`)
    // Here you would typically open another dialog to create a new item
    setSelectedOption(null)
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
          </div>
        </DialogContent>
      </Dialog>

      <SelectItemDialog
        isOpen={selectedOption !== null}
        onOpenChange={(open) => !open && setSelectedOption(null)}
        title={`Select a ${selectedOption === 'weekly-meetings' ? 'Meeting' : 'Tournament'}`}
        items={items}
        onSelectItem={handleSelectItem}
        onCreateNew={handleCreateNew}
        itemType={selectedOption || 'weekly-meetings'}
      />
    </>
  )
}