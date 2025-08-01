
'use client';

import { useState, useEffect } from 'react';
import { Button, ButtonProps } from './ui/button';
import { Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface InstallPwaButtonProps extends ButtonProps {
    // No new props, just inheriting from ButtonProps
}

export function InstallPwaButton({ className, variant, ...props }: InstallPwaButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the component only renders on the client, avoiding hydration errors.
    setIsClient(true);
  }, []);

  // Render nothing on the server.
  if (!isClient) {
    return null;
  }

  // A more robust check for PWA installability could be added here in the future.
  // For now, we assume it's generally available on mobile.

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
            variant={variant || "default"}
            size="icon"
            className={className}
            aria-label="Install App"
            {...props}
        >
          <Download className="h-6 w-6" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline">Install GoGhana Planner</AlertDialogTitle>
          <AlertDialogDescription>
            For the best experience, add this app to your home screen for quick access and offline use. Your browser should prompt you to install.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Got it!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
