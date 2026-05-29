const PRIVACY_POLICY_API_URL =
  "https://astrologer.nakshatraai.ai/api/astrologer/get-cms?userType=astrologer&pagetype=privacypolicy";

export const dynamic = "force-dynamic";

async function getPrivacyPolicyContent() {
  try {
    const response = await fetch(PRIVACY_POLICY_API_URL, { cache: "no-store" });
    if (!response.ok) {
      return { error: "Unable to load Privacy Policy right now." };
    }

    const json = await response.json();
    return { content: json?.data?.cms?.content ?? "" };
  } catch {
    return { error: "Unable to load Privacy Policy right now." };
  }
}

export const metadata = {
  title: "Privacy Policy | IMG Astrology",
  description: "Privacy policy for astrologers on IMG Astrology.",
};

import Link from "next/link";

export default async function PrivacyPolicyPage() {
  const { content, error } = await getPrivacyPolicyContent();

  return (
    <main className="h-full overflow-y-auto bg-primary-light">
      <div className="mx-auto w-full max-w-4xl px-6 py-4 md:px-8 md:py-5">
        <Link href="/login" className="mb-4 inline-flex items-center text-sm font-medium text-primary hover:opacity-80">
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-semibold text-[#222222]">Privacy Policy</h1>

        {error ? (
          <p className="mt-6 text-sm text-[#444444]">{error}</p>
        ) : (
          <div
            className="mt-6 text-sm leading-7 text-[#2E2E2E] [&_a]:text-primary [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </main>
  );
}
