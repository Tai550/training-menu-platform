import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Search, User, Bell, Menu, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: consultations, isLoading } = trpc.consultation.list.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/consultations?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 最新の相談を表示（最大10件）
  const recentConsultations = consultations?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="h-10 w-10" />
                <h1 className="text-lg font-bold text-[#1e3a5f]">{APP_TITLE || "トレーニングメニュー作成掲示板"}</h1>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Link href="/trainer-profile">
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">管理</Button>
                    </Link>
                  )}
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm">ログイン</Button>
                </a>
              )}
            </div>
          </div>

          {/* 検索バー */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Q&Aを探す"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" className="bg-[#1e3a5f] hover:bg-[#2d5380]">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6">
        {/* CTA セクション */}
        <Card className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5380] text-white p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-2">
                身近な疑問や悩みを<br />質問してみませんか？
              </h2>
              <Link href="/create-consultation">
                <Button className="bg-white text-[#1e3a5f] hover:bg-gray-100 font-bold">
                  質問してみる
                </Button>
              </Link>
            </div>
            <div className="hidden sm:block">
              <MessageCircle className="h-20 w-20 opacity-50" />
            </div>
          </div>
        </Card>

        {/* タブ風セクション */}
        <div className="mb-6">
          <div className="flex border-b">
            <button className="px-4 py-3 font-bold text-[#1e3a5f] border-b-2 border-[#1e3a5f]">
              回答募集中
            </button>
            <Link href="/consultations">
              <button className="px-4 py-3 text-gray-600 hover:text-gray-900">
                Q&A一覧
              </button>
            </Link>
          </div>
        </div>

        {/* 質問一覧 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          ) : recentConsultations.length > 0 ? (
            recentConsultations
              .filter(c => c.status === "open")
              .map((consultation) => (
                <Link key={consultation.id} href={`/consultations/${consultation.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                          {consultation.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {consultation.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {consultation.createdAt && new Date(consultation.createdAt).toLocaleDateString('ja-JP', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">まだ質問がありません</p>
              <Link href="/create-consultation">
                <Button>最初の質問を投稿する</Button>
              </Link>
            </div>
          )}
        </div>

        {/* もっと見るリンク */}
        {recentConsultations.length > 0 && (
          <div className="text-center mt-6">
            <Link href="/consultations">
              <Button variant="outline" className="w-full sm:w-auto">
                もっと見る →
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">&copy; 2025 {APP_TITLE || "トレーニングメニュー作成掲示板"}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

