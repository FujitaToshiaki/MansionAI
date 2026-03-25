import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Users, Search, ClipboardCheck } from "lucide-react";

interface Condominium {
  id: string;
  name: string;
  address: string;
  units: number;
}

interface CondominiumSearchPanelProps {
  targetPath: string;
  onSelect?: (condominiumId: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
  standalone?: boolean;
}

export default function CondominiumSearchPanel({
  targetPath,
  onSelect,
  placeholder = "マンション名・住所で検索...",
  title,
  description,
  standalone = false,
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

  if (standalone) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title || "物件を選択してください"}</h1>
          {description && <p className="text-gray-500">{description}</p>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-700">物件を検索</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-testid="input-search-condominium"
                placeholder={placeholder}
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="text-center py-6 text-gray-500">読み込み中...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-6 text-gray-500">物件が見つかりません</div>
            ) : (
              <div className="space-y-2">
                {filtered.map((condo) => (
                  <button
                    key={condo.id}
                    data-testid={`button-select-condominium-${condo.id}`}
                    onClick={() => handleSelect(condo)}
                    className="w-full text-left rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors p-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 group-hover:bg-blue-100 rounded-lg p-2 transition-colors">
                          <Building className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{condo.name}</p>
                          <p className="text-sm text-gray-500">{condo.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{condo.units}戸</Badge>
                        <Button size="sm" variant="ghost" className="text-blue-600 group-hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          選択
                        </Button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
