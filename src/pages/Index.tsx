import { useState, useMemo } from "react";
import { ConferenceCard } from "@/components/ConferenceCard";
import { FilterControls } from "@/components/FilterControls";
import { useConferences } from "@/hooks/useConferences";
import heroImage from "@/assets/hero-transport.jpg";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [selectedUniversity, setSelectedUniversity] = useState("Все университеты");
  const [selectedTopic, setSelectedTopic] = useState("Все темы");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conferences = [], isLoading, error } = useConferences();

  const filteredConferences = useMemo(() => {
    return conferences.filter((conference) => {
      const matchesUniversity =
        selectedUniversity === "Все университеты" || conference.university === selectedUniversity;
      const matchesTopic = selectedTopic === "Все темы" || conference.topic === selectedTopic;
      const matchesSearch =
        searchQuery === "" || conference.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesUniversity && matchesTopic && matchesSearch;
    });
  }, [conferences, selectedUniversity, selectedTopic, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Транспортные конференции"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/80" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Конференции транспортных университетов
            </h1>
            <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto">
              Актуальная информация о научных конференциях ведущих транспортных вузов России
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <FilterControls
              selectedUniversity={selectedUniversity}
              selectedTopic={selectedTopic}
              searchQuery={searchQuery}
              onUniversityChange={setSelectedUniversity}
              onTopicChange={setSelectedTopic}
              onSearchChange={setSearchQuery}
            />
          </aside>

          {/* Conference Grid */}
          <section>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Найдено конференций: <span className="font-semibold text-foreground">{filteredConferences.length}</span>
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-lg text-destructive">
                  Ошибка загрузки конференций
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Попробуйте обновить страницу
                </p>
              </div>
            ) : filteredConferences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredConferences.map((conference) => (
                  <ConferenceCard key={conference.id} conference={conference} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  Конференции по заданным критериям не найдены
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Попробуйте изменить параметры фильтрации
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
