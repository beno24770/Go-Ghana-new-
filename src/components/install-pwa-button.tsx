
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
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

export function InstallPwaButton() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the component only renders on the client, avoiding hydration errors.
    setIsClient(true);
  }, []);

  // Render nothing on the server.
  if (!isClient) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          aria-label="Install App"
        >
          <Download className="h-6 w-6" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline">Install GoGhana Planner</AlertDialogTitle>
          <AlertDialogDescription>
            For the best experience, add this app to your home screen for quick access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">Installation Steps:</h3>
            <ol className="list-decimal pl-5 text-sm text-muted-foreground">
              <li>Open your browser's menu (usually three dots or a share icon).</li>
              <li>Look for an option like <span className="font-bold">'Add to Home Screen'</span> or <span className="font-bold">'Install app'</span>.</li>
              <li>Follow the on-screen prompts to confirm.</li>
            </ol>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction>Got it!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
