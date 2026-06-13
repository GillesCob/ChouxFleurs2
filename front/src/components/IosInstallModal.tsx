import { PlusSquare, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface IIosInstallModalProps {
  open: boolean;
  onClose: () => void;
  onDismiss: () => void;
}

const steps = [
  {
    icon: Upload,
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-50',
    text: (
      <>
        Appuyez sur le bouton{' '}
        <strong>Partager</strong>{' '}
        <Upload className='inline h-3.5 w-3.5 align-middle text-blue-500' />{' '}
        en bas de Safari.
      </>
    ),
  },
  {
    icon: PlusSquare,
    iconClass: 'text-green-600',
    bgClass: 'bg-green-50',
    text: (
      <>
        Faites défiler et choisissez{' '}
        <strong>« Sur l'écran d'accueil »</strong>.
      </>
    ),
  },
  {
    icon: null,
    iconClass: '',
    bgClass: 'bg-muted',
    text: (
      <>
        Confirmez en appuyant sur{' '}
        <strong>« Ajouter »</strong> en haut à droite.
      </>
    ),
    emoji: '✓',
  },
];

export function IosInstallModal({ open, onClose, onDismiss }: IIosInstallModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <div className='flex justify-center'>
            <img src='/pwa-192x192.png' alt='ChouxFleurs' className='h-24 w-24 rounded-2xl shadow' />
          </div>
          <DialogTitle className='text-center text-xl'>Installer ChouxFleurs</DialogTitle>
          <DialogDescription className='text-center'>
            Accédez à l'app rapidement depuis votre écran d'accueil, même hors connexion.
          </DialogDescription>
        </DialogHeader>

        <ol className='mt-2 space-y-3'>
          {steps.map((step, i) => (
            <li key={i} className={`flex items-start gap-3 rounded-xl p-3 ${step.bgClass}`}>
              <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-sm font-bold text-foreground'>
                {i + 1}
              </span>
              <p className='text-sm leading-snug text-foreground'>{step.text}</p>
            </li>
          ))}
        </ol>

        <div className='mt-4 flex flex-col gap-2'>
          <Button onClick={onDismiss} className='w-full'>
            Ne plus afficher
          </Button>
          <Button variant='ghost' onClick={onClose} className='w-full'>
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
