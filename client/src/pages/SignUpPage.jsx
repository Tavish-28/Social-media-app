import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-900">
      <SignUp />
    </div>
  );
}
