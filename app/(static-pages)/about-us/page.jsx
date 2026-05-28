const ABOUT_US_API_URL =
  "https://astrologer.nakshatraai.ai/api/astrologer/get-cms?userType=astrologer&pagetype=aboutus";

export const dynamic = "force-dynamic";

async function getAboutUsContent() {
  try {
    const response = await fetch(ABOUT_US_API_URL, { cache: "no-store" });
    if (!response.ok) {
      return { error: "Unable to load About Us right now." };
    }

    const json = await response.json();
    return { content: json?.data?.cms?.content ?? "" };
  } catch {
    return { error: "Unable to load About Us right now." };
  }
}

export const metadata = {
  title: "About Us | Nakshatra.ai Astrologer",
  description: "About Nakshatra.ai Astrologer platform.",
};

export default async function AboutUsPage() {
  const { content, error } = await getAboutUsContent();

  return (
    <main className="h-full overflow-y-auto bg-primary-light">
      <div className="mx-auto w-full max-w-4xl px-6 py-4 md:px-8 md:py-5">
        <h1 className="text-2xl font-semibold text-[#222222]">About Us</h1>

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
