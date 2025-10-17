import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function ConsultationList() {
  const { user, isAuthenticated } = useAuth();
  const { data: consultations, isLoading } = trpc.consultation.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">{APP_TITLE}</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/consultations">
              <Button variant="ghost">相談一覧</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/create-consultation">
                  <Button variant="outline">相談を投稿</Button>
                </Link>
                <Link href="/trainer-profile">
                  <Button variant="ghost">プロフィール</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>ログイン</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">相談一覧</h2>
          <p className="text-gray-600">
            過去の相談事例を閲覧したり、新しい相談を投稿できます
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : consultations && consultations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {consultations.map((consultation) => {
              const tags = consultation.tags ? JSON.parse(consultation.tags) : [];
              return (
                <Link key={consultation.id} href={`/consultations/${consultation.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
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

