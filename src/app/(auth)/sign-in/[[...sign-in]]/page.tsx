import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center animate-fade-in">
        <SignIn
          appearance={{
            elements: {
              card: "shadow-xl border bg-card rounded-2xl",
              headerTitle: "gradient-text font-extrabold text-2xl",
              headerSubtitle: "text-muted-foreground text-sm",
              socialButtonsBlockButton: "rounded-full border hover:bg-muted/50",
              formButtonPrimary: "bg-primary hover:bg-primary/95 text-primary-foreground rounded-full font-semibold",
              footerActionLink: "text-primary hover:underline",
            },
          }}
        />
      </div>
    </div>
  );
}
