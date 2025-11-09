import PlatformPage from "./(platform)/page";

export default function HomePage() {
  return <PlatformPage />;
}

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';