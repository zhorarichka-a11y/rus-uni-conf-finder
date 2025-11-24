import { Conference } from "@/types/conference";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, University } from "lucide-react";

interface ConferenceCardProps {
  conference: Conference;
}

export const ConferenceCard = ({ conference }: ConferenceCardProps) => {
  const formatDate = (date: string, endDate?: string) => {
    const start = new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      });
      return `${start} — ${end}`;
    }
    return start;
  };

  return (
    <Card className="group overflow-hidden bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {conference.title}
          </h3>
          <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20">
            {conference.topic}
          </Badge>
        </div>

        <div className="space-y-2.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <University className="h-4 w-4 text-primary" />
            <span className="font-medium">{conference.university}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formatDate(conference.date, conference.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{conference.location}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {conference.description}
        </p>

        <div className="pt-2">
          <Button className="w-full" variant="default">
            Подробнее
          </Button>
        </div>
      </div>
    </Card>
  );
};
