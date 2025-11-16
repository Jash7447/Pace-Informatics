export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-white py-4">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear} Pace Informatics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

