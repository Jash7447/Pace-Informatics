export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="shrink-0 border-t bg-card/80 py-3">
      <div className="container mx-auto px-6">
        <p className="text-center text-xs text-muted-foreground">
          © {currentYear} Pace Informatics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

