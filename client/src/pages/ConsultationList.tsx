import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Loader2, User, Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function ConsultationList() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const { data: consultations, isLoading } = trpc.consultation.list.useQuery();

  // Extract search query from URL
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialSearchQuery = urlParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Filter consultations based on search query
  const filteredConsultations = useMemo(() => {
    if (!consultations) return [];
    if (!searchQuery.trim()) return consultations;

    const query = searchQuery.toLowerCase();
    return consultations.filter((c) =>
      c.title?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      (c.tags && JSON.parse(c.tags).some((tag: string) => tag.toLowerCase().includes(query)))
    );
  }, [consultations, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">相談一覧</h2>
          <p className="text-gray-600">
            過去の相談事例を閲覧したり、新しい相談を投稿できます
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="タイトル、内容、タグで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              {filteredConsultations.length}件の検索結果
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredConsultations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredConsultations.map((consultation) => {
              const tags = consultation.tags ? JSON.parse(consultation.tags) : [];
              return (
                <Link key={consultation.id} href={`/consultations/${consultation.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      {/* 質問者情報 */}
                      <div className="flex items-center gap-2 mb-3">
                        {consultation.userPhoto ? (
                          <img
                            src={consultation.userPhoto}
                            alt={consultation.userName || "ユーザー"}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm text-gray-700">{consultation.userName || "匿名ユーザー"}</span>
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={
                          consultation.status === "open" ? "default" :
                          consultation.status === "answered" ? "secondary" : "outline"
                        }>
                          {consultation.status === "open" ? "募集中" :
                           consultation.status === "answered" ? "回答済み" : "終了"}
                        </Badge>
                        {(consultation.amount ?? 0) > 0 && (
                          <span className="text-sm font-semibold text-primary">
                            ¥{(consultation.amount ?? 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2">{consultation.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3 mb-4">
                        {consultation.description}
                      </CardDescription>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 text-xs text-gray-500">
                        {new Date(consultation.createdAt!).toLocaleDateString('ja-JP')}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">まだ相談が投稿されていません</p>
              {isAuthenticated && (
                <Link href="/create-consultation">
                  <Button>最初の相談を投稿する</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

