import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
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

export default function EditProposal() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const { data: proposal, isLoading } = trpc.proposal.getById.useQuery({ id: proposalId! });
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState("");
  const [program, setProgram] = useState<DayProgram[]>([
    { day: 1, exercises: [{ name: "" }] }
  ]);

  useEffect(() => {
    if (proposal) {
      setTitle(proposal.title);
      setContent(proposal.content);
      setDuration(proposal.duration || "");
      setFrequency(proposal.frequency || "");
      if (proposal.program) {
        const parsedProgram = JSON.parse(proposal.program);
        setProgram(parsedProgram.length > 0 ? parsedProgram : [{ day: 1, exercises: [{ name: "" }] }]);
      }
    }
  }, [proposal]);

  const updateMutation = trpc.proposal.update.useMutation({
    onSuccess: () => {
      toast.success("メニューを更新しました");
      setLocation(`/consultations/${proposal?.consultationId}`);
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

    updateMutation.mutate({
      id: proposalId!,
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
          </CardHeader>
          <CardContent>
            <p>メニューを編集するにはログインしてください。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>読み込み中...</p>
        </div>
      </>
    );
  }

  if (!proposal) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>提案が見つかりません</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  if (proposal.trainerId !== user?.id) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>アクセス権限がありません</CardTitle>
            </CardHeader>
            <CardContent>
              <p>この提案を編集する権限がありません。</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>トレーニングメニュー提案を編集</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">提案タイトル</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：初心者向け4週間ダイエットプログラム"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">提案内容</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="このプログラムの目的、特徴、期待される効果などを説明してください"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">期間</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="例：4週間"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">頻度</Label>
                  <Input
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="例：週3回"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>トレーニングプログラム</Label>
                  <Button type="button" onClick={addDay} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    日を追加
                  </Button>
                </div>

                <div className="space-y-4">
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
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {day.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="border p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                  <Label>エクササイズ名</Label>
                                  <Input
                                    value={exercise.name}
                                    onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'name', e.target.value)}
                                    placeholder="例：スクワット"
                                  />
                                </div>
                                <div>
                                  <Label>セット数</Label>
                                  <Input
                                    type="number"
                                    value={exercise.sets || ""}
                                    onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'sets', parseInt(e.target.value) || 0)}
                                    placeholder="3"
                                  />
                                </div>
                                <div>
                                  <Label>回数</Label>
                                  <Input
                                    value={exercise.reps || ""}
                                    onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'reps', e.target.value)}
                                    placeholder="10-12"
                                  />
                                </div>
                                <div>
                                  <Label>時間</Label>
                                  <Input
                                    value={exercise.duration || ""}
                                    onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'duration', e.target.value)}
                                    placeholder="30秒"
                                  />
                                </div>
                                <div>
                                  <Label>メモ</Label>
                                  <Input
                                    value={exercise.notes || ""}
                                    onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'notes', e.target.value)}
                                    placeholder="フォームに注意"
                                  />
                                </div>
                              </div>
                              {day.exercises.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeExercise(dayIndex, exerciseIndex)}
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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
                          <Plus className="h-4 w-4 mr-2" />
                          エクササイズを追加
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "更新中..." : "更新する"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/consultations/${proposal.consultationId}`)}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

