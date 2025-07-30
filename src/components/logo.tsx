
export function Logo() {
  return (
    <div className="flex flex-col">
      <h1 className="font-headline text-4xl font-bold tracking-tight">
        <span style={{ color: 'hsl(var(--primary))' }}>Go</span>
        <span style={{ color: 'hsl(var(--secondary))' }}>Ghana</span>
      </h1>
      <p className="text-sm text-muted-foreground -mt-1">Your journey, guided by a local.</p>
    </div>
  );
}
