'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreSelect: (score: [number, number]) => void;
  maxPoints: number;
  teamOneName: string;
  teamTwoName: string;
  selectedTeam: 'team1' | 'team2';
}

export default function ScoreModal({
  isOpen,
  onClose,
  onScoreSelect,
  maxPoints,
  teamOneName,
  teamTwoName,
  selectedTeam
}: ScoreModalProps) {
  const handleScoreSelection = (selectedScore: number) => {
    const remainingScore = maxPoints - selectedScore;
    
    if (selectedTeam === 'team1') {
      onScoreSelect([selectedScore, remainingScore]);
    } else {
      onScoreSelect([remainingScore, selectedScore]);
    }
    
    onClose();
  };

  const scoreButtonArray = Array.from({ length: maxPoints + 1 }, (_, index) => index);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-3 sm:mx-4">
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle className="text-base sm:text-lg text-center">
            Score for {selectedTeam === 'team1' ? teamOneName : teamTwoName}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 sm:p-6 pt-2">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
            {scoreButtonArray.map(score => (
              <Button
                key={score}
                onClick={() => handleScoreSelection(score)}
                variant="outline"
                className="h-10 sm:h-12 text-base sm:text-lg font-semibold"
              >
                {score}
              </Button>
            ))}
          </div>
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground px-2">
            {selectedTeam === 'team1' ? teamTwoName : teamOneName} will get the remaining points
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}