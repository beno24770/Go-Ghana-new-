export function Logo() {
  return (
    <div className="flex flex-col">
      <h1 className="font-headline text-4xl font-bold tracking-tight">
        <span style={{ color: 'hsl(var(--secondary))' }}>Go</span>
        <span style={{ color: 'hsl(var(--primary))' }}>Ghana</span>
      </h1>
      <p className="text-sm text-muted-foreground -mt-1">Your Journey, Your Way</p>
    </div>
  );
}
