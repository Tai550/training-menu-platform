import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { Loader2, User, Award, ExternalLink } from "lucide-react";

export default function TrainerPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading: userLoading } = trpc.admin.getUserById.useQuery({ userId: id! });
  const { data: profile, isLoading: profileLoading } = trpc.trainer.getProfile.useQuery({ userId: id! });

  const isLoading = userLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">トレーナー情報が見つかりません</p>
        </div>
      </div>
    );
  }

  const specialties = profile.specialties ? JSON.parse(profile.specialties) : [];
  const certifications = profile.certifications ? JSON.parse(profile.certifications) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              {/* プロフィール写真 */}
              <div className="flex-shrink-0">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={user.name || "トレーナー"}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                    <User className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>

              {/* 基本情報 */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user.name || "トレーナー"}</h1>
                  {user.isApprovedTrainer && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      認定トレーナー
                    </Badge>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{profile.bio}</p>
                )}

                {/* SNSリンク */}
                {(profile.twitterUrl || profile.instagramUrl || profile.facebookUrl || profile.youtubeUrl || profile.websiteUrl) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.twitterUrl && (
                      <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Twitter/X
                        </Button>
                      </a>
                    )}
                    {profile.instagramUrl && (
                      <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Instagram
                        </Button>
                      </a>
                    )}
                    {profile.facebookUrl && (
                      <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Facebook
                        </Button>
                      </a>
                    )}
                    {profile.youtubeUrl && (
                      <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          YouTube
                        </Button>
                      </a>
                    )}
                    {profile.websiteUrl && (
                      <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          公式サイト
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 専門分野 */}
            {specialties.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">専門分野</h3>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 資格 */}
            {certifications.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">保有資格</h3>
                <ul className="space-y-2">
                  {certifications.map((cert: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 経験年数 */}
            {profile.yearsOfExperience && (
              <div>
                <h3 className="font-semibold text-lg mb-3">経験年数</h3>
                <p className="text-gray-700">{profile.yearsOfExperience}年</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

