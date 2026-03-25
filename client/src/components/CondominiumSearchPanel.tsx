import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Building, MapPin, Users, Search } from "lucide-react";

interface Condominium {
  id: number;
  name: string;
  address: string;
  units: number;
}

interface CondominiumSearchPanelProps {
  targetPath: string;
  onSelect?: (condominiumId: number) => void;
  placeholder?: string;
}

export default function CondominiumSearchPanel({
  targetPath,
  onSelect,
  placeholder = "マンション名・住所で検索...",
}: CondominiumSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: condominiums = [], isLoading } = useQuery<Condominium[]>({
    queryKey: ["/api/condominiums"],
  });

  const filtered = condominiums.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    );
  });

  const handleSelect = (condominium: Condominium) => {
    if (onSelect) {
      onSelect(condominium.id);
    }
    navigate(`/condominiums/${condominium.id}${targetPath}`);
  };

  return (
    <div className="space-y-3" data-testid="condominium-search-panel">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          data-testid="input-condominium-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500 text-center py-4">読み込み中...</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          該当するマンションが見つかりません
        </p>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((condominium) => (
            <Card
              key={condominium.id}
              data-testid={`card-condominium-${condominium.id}`}
              className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200"
              onClick={() => handleSelect(condominium)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-500 shrink-0" />
                      <span
                        data-testid={`text-condominium-name-${condominium.id}`}
                        className="font-medium text-gray-900"
                      >
                        {condominium.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span data-testid={`text-condominium-address-${condominium.id}`}>
                        {condominium.address}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
                    <Users className="w-3 h-3" />
                    <span data-testid={`text-condominium-units-${condominium.id}`}>
                      {condominium.units}戸
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
