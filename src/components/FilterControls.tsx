import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UNIVERSITIES, TOPICS } from "@/types/conference";
import { Calendar } from "lucide-react";

interface FilterControlsProps {
  selectedUniversity: string;
  selectedTopic: string;
  searchQuery: string;
  onUniversityChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export const FilterControls = ({
  selectedUniversity,
  selectedTopic,
  searchQuery,
  onUniversityChange,
  onTopicChange,
  onSearchChange,
}: FilterControlsProps) => {
  return (
    <div className="bg-card rounded-xl shadow-card p-6 space-y-5">
      <div className="flex items-center gap-2 pb-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Фильтры</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Поиск по названию
          </Label>
          <Input
            id="search"
            placeholder="Введите название конференции..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="university" className="text-sm font-medium">
            Университет
          </Label>
          <Select value={selectedUniversity} onValueChange={onUniversityChange}>
            <SelectTrigger id="university">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIVERSITIES.map((university) => (
                <SelectItem key={university} value={university}>
                  {university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic" className="text-sm font-medium">
            Тема
          </Label>
          <Select value={selectedTopic} onValueChange={onTopicChange}>
            <SelectTrigger id="topic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
