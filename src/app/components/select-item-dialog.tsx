import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Meeting, Tournament } from '../types'
import WeeklyMeetingDetailsDialog from './weekly-meeting-details-dialog'

type SelectItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: (Meeting | Tournament)[];
  onSelectItem: (item: Meeting | Tournament) => void;
  onCreateNew: () => void;
  itemType: 'weekly-meetings' | 'tournaments';
}

export default function SelectItemDialog({
  isOpen,
  onOpenChange,
  title,
  items,
  onSelectItem,
  onCreateNew,
  itemType
}: SelectItemDialogProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  const handleItemClick = (item: Meeting | Tournament) => {
    if (itemType === 'weekly-meetings') {
      setSelectedMeeting(item as Meeting)
    } else {
      onSelectItem(item)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Select an item to edit or create a new one.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            {items.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start mb-2"
                onClick={() => handleItemClick(item)}
              >
                {item.name}
              </Button>
            ))}
          </ScrollArea>
          <Button onClick={onCreateNew} className="w-full mt-4">
            <span className="mr-2">+</span> Create New
          </Button>
        </DialogContent>
      </Dialog>

      {itemType === 'weekly-meetings' && (
        <WeeklyMeetingDetailsDialog
          meeting={selectedMeeting}
          isOpen={!!selectedMeeting}
          onOpenChange={(open) => !open && setSelectedMeeting(null)}
        />
      )}
    </>
  )
}