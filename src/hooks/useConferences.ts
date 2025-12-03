import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conference } from "@/types/conference";

export const useConferences = () => {
  return useQuery({
    queryKey: ["conferences"],
    queryFn: async (): Promise<Conference[]> => {
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("conferences")
        .select("*")
        .gte("date", today)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching conferences:", error);
        throw error;
      }

      return (data || []).map((conf) => ({
        id: conf.id,
        title: conf.title,
        university: conf.university,
        date: conf.date,
        endDate: conf.end_date || undefined,
        location: conf.location,
        topic: conf.topic,
        description: conf.description,
        format: conf.format as Conference["format"],
        registrationUrl: conf.registration_url || undefined,
        registrationDeadline: conf.registration_deadline || undefined,
        contactEmail: conf.contact_email || undefined,
        contactPhone: conf.contact_phone || undefined,
        venue: conf.venue || undefined,
        fee: conf.fee || undefined,
      }));
    },
  });
};
