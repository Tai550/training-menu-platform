import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { X, User } from "lucide-react";

export default function CreateConsultation() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [amount, setAmount] = useState("");

  const { data: profile } = trpc.userProfile.getProfile.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id }
  );

  const createMutation = trpc.consultation.create.useMutation({
    onSuccess: (data) => {
      toast.success("相談を投稿しました");
      setLocation(`/consultations/${data.id}`);
    },
    onError: (error) => {
      toast.error("エラーが発生しました: " + error.message);
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleLoadFromProfile = () => {
    if (profile) {
      if (profile.height) setHeight(profile.height.toString());
      if (profile.weight) setWeight(profile.weight.toString());
      toast.success("プロフィール情報を読み込みました");
    } else {
      toast.error("プロフィール情報が見つかりません");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error("タイトルと相談内容は必須です");
      return;
    }

    createMutation.mutate({
      title,
      description,
      goals: goals.trim() || undefined,
      currentLevel: currentLevel.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      amount: amount ? parseInt(amount) : undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>相談を投稿するにはログインしてください</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">ログイン</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">相談を投稿</CardTitle>
            <CardDescription>
              あなたの課題や目標を投稿して、トレーナーからメニュー提案を受け取りましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 産後ダイエットのためのトレーニングメニュー"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">相談内容 *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="現在の状況や悩み、どのようなメニューを求めているかを詳しく記載してください"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="goals">目標</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="達成したい目標を記載してください（例: 3ヶ月で5kg減量）"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="currentLevel">現在のレベル</Label>
                <Input
                  id="currentLevel"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  placeholder="例: 運動初心者、週1回ジムに通っている など"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">身長 (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">体重 (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="65"
                  />
                </div>
              </div>

              {profile && (profile.height || profile.weight) && (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadFromProfile}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    プロフィールから入力
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="tags">タグ</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="タグを入力してEnterキーで追加"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    追加
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-primary/70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="amount">課金額（円）</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  ※ 現在は参考価格として表示されます。実際の課金機能は今後実装予定です。
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "投稿中..." : "投稿する"}
                </Button>
                <Link href="/consultations">
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
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

