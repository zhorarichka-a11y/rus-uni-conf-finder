import { Conference } from "@/types/conference";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, University, Monitor, Mail, Phone, MapPinned, CreditCard, Clock, ExternalLink } from "lucide-react";

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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" variant="default">
                Подробнее
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-foreground pr-6">
                  {conference.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {conference.topic}
                  </Badge>
                  <Badge variant="outline" className="border-primary/30">
                    {conference.format}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <University className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">{conference.university}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Даты проведения</p>
                      <p className="text-muted-foreground">{formatDate(conference.date, conference.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Место проведения</p>
                      <p className="text-muted-foreground">{conference.location}</p>
                    </div>
                  </div>

                  {conference.venue && (
                    <div className="flex items-start gap-3">
                      <MapPinned className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Адрес</p>
                        <p className="text-muted-foreground">{conference.venue}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Формат проведения</p>
                      <p className="text-muted-foreground">{conference.format}</p>
                    </div>
                  </div>

                  {conference.registrationDeadline && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Срок регистрации</p>
                        <p className="text-muted-foreground">
                          до {new Date(conference.registrationDeadline).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {conference.fee && (
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Участие</p>
                        <p className="text-muted-foreground">{conference.fee}</p>
                      </div>
                    </div>
                  )}

                  {conference.contactEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Email</p>
                        <a href={`mailto:${conference.contactEmail}`} className="text-primary hover:underline">
                          {conference.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {conference.contactPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Телефон</p>
                        <a href={`tel:${conference.contactPhone}`} className="text-primary hover:underline">
                          {conference.contactPhone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold text-foreground mb-2">О конференции</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {conference.description}
                  </p>
                </div>

                {conference.registrationUrl && (
                  <div className="pt-2">
                    <Button asChild className="w-full" size="lg">
                      <a href={conference.registrationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        Зарегистрироваться
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};
