import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {

  const slug = params.then((res) => res.slug);
  
  return (
    <main>
      <Suspense fallback={<div>Fetching event details...</div>}>
        <EventDetails params={slug} />
      </Suspense>
    </main>
  );
}; 

export default EventDetailsPage;
