import { ProfileForm } from "@/components/profile/profile-form";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Freelancer profile
        </h1>
        <p className="text-sm text-muted-foreground">
          This is the verified information the AI will draw on when it drafts
          proposals for you. It will only use what you save here — including
          your experience and evidence — rather than inventing claims on your
          behalf.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
