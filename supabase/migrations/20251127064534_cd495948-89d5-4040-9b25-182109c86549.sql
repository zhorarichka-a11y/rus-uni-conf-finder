-- Создание таблицы для конференций
CREATE TABLE public.conferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  university TEXT NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  location TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('Очно', 'Онлайн', 'Гибридный')),
  registration_url TEXT,
  registration_deadline DATE,
  contact_email TEXT,
  contact_phone TEXT,
  venue TEXT,
  fee TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включение RLS
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

-- Политики RLS - конференции публичны для чтения
CREATE POLICY "Конференции доступны всем для просмотра"
  ON public.conferences
  FOR SELECT
  USING (true);

-- Создание индексов для оптимизации поиска
CREATE INDEX idx_conferences_date ON public.conferences(date);
CREATE INDEX idx_conferences_university ON public.conferences(university);
CREATE INDEX idx_conferences_topic ON public.conferences(topic);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_conferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at
CREATE TRIGGER update_conferences_updated_at_trigger
  BEFORE UPDATE ON public.conferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conferences_updated_at();

-- Создание таблицы для хранения источников парсинга
CREATE TABLE public.scraping_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('university', 'scientific_portal')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS для источников
ALTER TABLE public.scraping_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Источники доступны всем для просмотра"
  ON public.scraping_sources
  FOR SELECT
  USING (true);

-- Добавление начальных источников
INSERT INTO public.scraping_sources (name, url, source_type) VALUES
  ('РУТ (МИИТ)', 'https://www.miit.ru/', 'university'),
  ('ПГУПС', 'https://pgups.ru/', 'university'),
  ('РГУПС', 'https://www.rgups.ru/', 'university'),
  ('СибГУПС', 'https://www.stu.ru/', 'university'),
  ('УрГУПС', 'https://usurt.ru/', 'university'),
  ('ДВГУПС', 'https://www.dvgups.ru/', 'university'),
  ('СамГУПС', 'https://www.samgups.ru/', 'university'),
  ('ИрГУПС', 'https://www.irgups.ru/', 'university');