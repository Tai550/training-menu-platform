import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation, Link } from "wouter";
import { Loader2, Award, User } from "lucide-react";
import { toast } from "sonner";

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: consultation, isLoading: consultationLoading } = trpc.consultation.getById.useQuery({ id: id! });
  const { data: proposals, isLoading: proposalsLoading } = trpc.proposal.listByConsultation.useQuery({ consultationId: id! });
  
  const selectBestAnswer = trpc.consultation.selectBestAnswer.useMutation({
    onSuccess: () => {
      toast.success("ベストアンサーを選択しました");
      utils.consultation.getById.invalidate({ id: id! });
      utils.proposal.listByConsultation.invalidate({ consultationId: id! });
    },
    onError: (error) => {
      toast.error("エラーが発生しました: " + error.message);
    },
  });

  const handleSelectBestAnswer = (proposalId: string) => {
    if (confirm("このメニューをベストアンサーに選択しますか?")) {
      selectBestAnswer.mutate({ consultationId: id!, proposalId });
    }
  };

  if (consultationLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>相談が見つかりません</p>
      </div>
    );
  }

  const tags = consultation.tags ? JSON.parse(consultation.tags) : [];
  const isOwner = user?.id === consultation.userId;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Consultation Details */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <Badge variant={
                consultation.status === "open" ? "default" :
                consultation.status === "answered" ? "secondary" : "outline"
              }>
                {consultation.status === "open" ? "募集中" :
                 consultation.status === "answered" ? "回答済み" : "終了"}
              </Badge>
              {(consultation.amount ?? 0) > 0 && (
                <span className="text-lg font-semibold text-primary">
                  ¥{(consultation.amount ?? 0).toLocaleString()}
                </span>
              )}
            </div>
            <CardTitle className="text-3xl">{consultation.title}</CardTitle>
            <CardDescription>
              投稿日: {new Date(consultation.createdAt!).toLocaleDateString('ja-JP')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">相談内容</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{consultation.description}</p>
              </div>
              
              {consultation.goals && (
                <div>
                  <h3 className="font-semibold mb-2">目標</h3>
                  <p className="text-gray-700">{consultation.goals}</p>
                </div>
              )}
              
              {consultation.currentLevel && (
                <div>
                  <h3 className="font-semibold mb-2">現在のレベル</h3>
                  <p className="text-gray-700">{consultation.currentLevel}</p>
                </div>
              )}
              
              {tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Proposals Section */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">トレーニングメニュー提案</h2>
          {isAuthenticated && !isOwner && consultation.status === "open" && (
            <Link href={`/consultations/${id}/propose`}>
              <Button>メニューを提案する</Button>
            </Link>
          )}
        </div>

        {proposalsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-6">
            {proposals.map((proposal) => {
              const program = proposal.program ? JSON.parse(proposal.program) : null;
              return (
                <Card key={proposal.id} className={proposal.isBestAnswer ? "border-2 border-primary" : ""}>
                  <CardHeader>
                    {/* トレーナー情報 */}
                    <div className="flex items-center gap-3 mb-4">
                      <Link href={`/trainer/${proposal.trainerId}`}>
                        <div className="cursor-pointer">
                          {proposal.trainerPhotoUrl ? (
                            <img
                              src={proposal.trainerPhotoUrl}
                              alt={proposal.trainerName || "トレーナー"}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:border-primary transition-colors"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 hover:border-primary transition-colors">
                              <User className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/trainer/${proposal.trainerId}`}>
                          <p className="font-semibold text-gray-900 hover:text-primary cursor-pointer">{proposal.trainerName}</p>
                        </Link>
                        <p className="text-sm text-gray-500">認定トレーナー</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        {proposal.title}
                        {proposal.isBestAnswer && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            ベストアンサー
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        {isOwner && !consultation.bestAnswerId && (
                          <Button
                            size="sm"
                            onClick={() => handleSelectBestAnswer(proposal.id)}
                            disabled={selectBestAnswer.isPending}
                          >
                            ベストアンサーに選ぶ
                          </Button>
                        )}
                        {user?.id === proposal.trainerId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLocation(`/proposals/${proposal.id}/edit`)}
                          >
                            編集
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {proposal.duration && `期間: ${proposal.duration}`}
                      {proposal.frequency && ` | 頻度: ${proposal.frequency}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">提案内容</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{proposal.content}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">トレーニングプログラム</h4>
                        <div className="space-y-4">
                          {program.map((day: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <h5 className="font-semibold mb-2">{day.day}</h5>
                              <ul className="space-y-2">
                                {day.exercises.map((exercise: any, exIdx: number) => (
                                  <li key={exIdx} className="text-sm">
                                    <span className="font-medium">{exercise.name}</span>
                                    {exercise.sets && <span className="text-gray-600"> - {exercise.sets}セット</span>}
                                    {exercise.reps && <span className="text-gray-600"> × {exercise.reps}回</span>}
                                    {exercise.duration && <span className="text-gray-600"> ({exercise.duration})</span>}
                                    {exercise.notes && <p className="text-gray-500 text-xs mt-1">{exercise.notes}</p>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        投稿日: {new Date(proposal.createdAt!).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">まだメニュー提案がありません</p>
              {isAuthenticated && !isOwner && (
                <Link href={`/consultations/${id}/propose`}>
                  <Button>最初のメニューを提案する</Button>
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

