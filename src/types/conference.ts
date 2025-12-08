export interface Conference {
  id: string;
  title: string;
  university: string;
  date: string;
  endDate?: string;
  location: string;
  topic: string;
  description: string;
  format: "Очно" | "Онлайн" | "Гибридный";
  registrationUrl?: string;
  registrationDeadline?: string;
  contactEmail?: string;
  contactPhone?: string;
  venue?: string;
  fee?: string;
  sourceUrl?: string;
}

export const UNIVERSITIES = [
  "Все университеты",
  "МИИТ (РУТ)",
  "ПГУПС",
  "РГУПС",
  "СибГУПС",
  "УрГУПС",
  "МГАВТ",
  "ДВГУПС",
  "СамГУПС",
  "ВГУВТ",
  "МАДИ",
  "ИрГУПС",
] as const;

export const TOPICS = [
  "Все темы",
  "Железнодорожный транспорт",
  "Автомобильный транспорт",
  "Водный транспорт",
  "Авиационный транспорт",
  "Логистика",
  "Цифровые технологии",
  "Экология",
] as const;
