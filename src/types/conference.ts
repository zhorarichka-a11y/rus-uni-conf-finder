export interface Conference {
  id: string;
  title: string;
  university: string;
  date: string;
  endDate?: string;
  location: string;
  topic: string;
  description: string;
  registrationUrl?: string;
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
