import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  notes?: string;
}

interface DayProgram {
  day: number;
  exercises: Exercise[];
}

export default function CreateProposal() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: consultation } = trpc.consultation.getById.useQuery({ id: consultationId! });
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState("");
  const [program, setProgram] = useState<DayProgram[]>([
    { day: 1, exercises: [{ name: "" }] }
  ]);

  const createMutation = trpc.proposal.create.useMutation({
    onSuccess: () => {
      toast.success("メニューを提案しました");
      setLocation(`/consultations/${consultationId}`);
    },
    onError: (error) => {
      toast.error("エラーが発生しました: " + error.message);
    },
  });

  const addDay = () => {
    setProgram([...program, { day: program.length + 1, exercises: [{ name: "" }] }]);
  };

  const removeDay = (dayIndex: number) => {
    setProgram(program.filter((_, idx) => idx !== dayIndex));
  };

  const addExercise = (dayIndex: number) => {
    const newProgram = [...program];
    newProgram[dayIndex].exercises.push({ name: "" });
    setProgram(newProgram);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const newProgram = [...program];
    newProgram[dayIndex].exercises = newProgram[dayIndex].exercises.filter((_, idx) => idx !== exerciseIndex);
    setProgram(newProgram);
  };

  const updateDay = (dayIndex: number, field: string, value: number) => {
    const newProgram = [...program];
    newProgram[dayIndex].day = value;
    setProgram(newProgram);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: string | number) => {
    const newProgram = [...program];
    newProgram[dayIndex].exercises[exerciseIndex][field] = value as never;
    setProgram(newProgram);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("タイトルと提案内容は必須です");
      return;
    }

    // プログラムの検証
    const validProgram = program
      .filter(day => day.exercises.some(ex => ex.name.trim()))
      .map(day => ({
        day: typeof day.day === 'string' ? parseInt(day.day) || 1 : day.day,
        exercises: day.exercises
          .filter(ex => ex.name.trim())
          .map(ex => ({
            name: ex.name,
            sets: typeof ex.sets === 'string' ? parseInt(ex.sets) || undefined : ex.sets,
            reps: ex.reps,
            duration: ex.duration,
            notes: ex.notes,
          }))
      }));

    if (validProgram.length === 0) {
      toast.error("少なくとも1つのエクササイズを追加してください");
      return;
    }

    createMutation.mutate({
      consultationId: consultationId!,
      title,
      content,
      program: validProgram,
      duration: duration.trim() || undefined,
      frequency: frequency.trim() || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>メニューを提案するにはログインしてください</CardDescription>
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
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        {consultation && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>相談内容</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">{consultation.title}</h3>
              <p className="text-gray-700 text-sm">{consultation.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">トレーニングメニューを提案</CardTitle>
            <CardDescription>
              相談者の課題に合わせた具体的なトレーニングメニューを作成してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">提案タイトル *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 産後の体力回復と引き締めプログラム"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">提案内容 *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="このプログラムの特徴、期待される効果、注意点などを記載してください"
                  rows={6}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">期間</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="例: 4週間"
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">頻度</Label>
                  <Input
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="例: 週3回"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg">トレーニングプログラム</Label>
                  <Button type="button" onClick={addDay} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    日を追加
                  </Button>
                </div>

                <div className="space-y-6">
                  {program.map((day, dayIndex) => (
                    <Card key={dayIndex}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <Input
                            type="number"
                            value={day.day}
                            onChange={(e) => updateDay(dayIndex, 'day', parseInt(e.target.value) || 1)}
                            className="max-w-xs font-semibold"
                          />
                          {program.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeDay(dayIndex)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {day.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <Label>エクササイズ名</Label>
                                <Input
                                  value={exercise.name}
                                  onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'name', e.target.value)}
                                  placeholder="例: スクワット"
                                />
                              </div>
                              {day.exercises.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeExercise(dayIndex, exerciseIndex)}
                                  variant="ghost"
                                  size="sm"
                                  className="mt-6"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label>セット数</Label>
                                <Input
                                  value={exercise.sets || ""}
                                  onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'sets', e.target.value)}
                                  placeholder="例: 3"
                                />
                              </div>
                              <div>
                                <Label>回数</Label>
                                <Input
                                  value={exercise.reps || ""}
                                  onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'reps', e.target.value)}
                                  placeholder="例: 10"
                                />
                              </div>
                              <div>
                                <Label>時間</Label>
                                <Input
                                  value={exercise.duration || ""}
                                  onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'duration', e.target.value)}
                                  placeholder="例: 30秒"
                                />
                              </div>
                            </div>

                            <div>
                              <Label>メモ・注意点</Label>
                              <Input
                                value={exercise.notes || ""}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'notes', e.target.value)}
                                placeholder="フォームや注意点など"
                              />
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          onClick={() => addExercise(dayIndex)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          エクササイズを追加
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "提案中..." : "提案する"}
                </Button>
                <Link href={`/consultations/${consultationId}`}>
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

