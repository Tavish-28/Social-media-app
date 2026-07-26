import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-900">
      <SignIn />
    </div>
  );
}
