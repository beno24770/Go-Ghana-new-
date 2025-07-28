
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, Share } from 'lucide-react';
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
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // This check runs only on the client-side
    const userAgent = window.navigator.userAgent;
    setIsIos(/iPhone|iPad|iPod/.test(userAgent));
  }, []);

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
            For the best experience, add this app to your home screen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          {isIos ? (
            <div>
              <h3 className="font-bold">For iOS (iPhone/iPad):</h3>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                <li>Tap the <span className="font-bold">Share</span> icon in the Safari toolbar.</li>
                <li>Scroll down and tap <span className="font-bold">'Add to Home Screen'</span>.</li>
                <li>Confirm by tapping <span className="font-bold">'Add'</span> in the top-right corner.</li>
              </ol>
            </div>
          ) : (
            <div>
              <h3 className="font-bold">For Android:</h3>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                <li>Tap the <span className="font-bold">three dots</span> in the top-right corner of Chrome.</li>
                <li>Tap <span className="font-bold">'Install app'</span> or <span className="font-bold">'Add to Home screen'</span>.</li>
                <li>Follow the on-screen instructions.</li>
              </ol>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction>Got it!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    