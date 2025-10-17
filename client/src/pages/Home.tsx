import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { MessageSquare, Users, TrendingUp, Award } from "lucide-react";
import Header from "@/components/Header";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6 text-gray-900">
            あなたの目標に合わせた<br />トレーニングメニューを専門家から
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            課題や目標を投稿すると、認定トレーナーから複数の提案を受け取れます。
            自分に最適なプログラムを見つけましょう。
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/consultations">
              <Button size="lg" variant="outline">
                相談事例を見る
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/create-consultation">
                <Button size="lg">
                  相談を投稿する
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg">
                  今すぐ始める
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">FitMentorの特徴</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <MessageSquare className="w-12 h-12 text-primary mb-4" />
                <CardTitle>専門家への相談</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  認定トレーナーに直接相談し、あなたの課題に合わせたトレーニングメニューを提案してもらえます。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle>複数の提案</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  一つの相談に対して複数のトレーナーから提案を受け取れるので、比較検討できます。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-primary mb-4" />
                <CardTitle>実践的な学び</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  トレーナーにとっては、様々なケースに対応することでスキルアップの機会になります。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="w-12 h-12 text-primary mb-4" />
                <CardTitle>豊富な事例</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  過去の相談事例を閲覧できるので、自分と似た悩みを持つ人のプログラムを参考にできます。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">今すぐ始めましょう</h3>
          <p className="text-xl mb-8">
            あなたの目標達成をサポートする専門家が待っています
          </p>
          {isAuthenticated ? (
            <Link href="/create-consultation">
              <Button size="lg" variant="secondary">
                相談を投稿する
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary">
                無料で始める
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

