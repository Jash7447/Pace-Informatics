import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Pace Informatics</h1>
          <p className="text-sm text-muted-foreground">
            Product inventory management
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
