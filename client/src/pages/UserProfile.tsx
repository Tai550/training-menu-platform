import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Upload, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function UserProfile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [bio, setBio] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading: profileLoading } = trpc.userProfile.getProfile.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id }
  );

  const uploadPhoto = trpc.storage.uploadProfilePhoto.useMutation();
  const updateProfile = trpc.userProfile.createOrUpdateProfile.useMutation({
    onSuccess: () => {
      toast.success("プロフィールを更新しました");
      utils.userProfile.getProfile.invalidate({ userId: user?.id ?? "" });
    },
    onError: (error) => {
      toast.error("エラーが発生しました: " + error.message);
    },
  });

  useEffect(() => {
    if (profile) {
      setProfilePhoto(profile.profilePhoto || "");
      setBio(profile.bio || "");
      setHeight(profile.height ? profile.height.toString() : "");
      setWeight(profile.weight ? profile.weight.toString() : "");
      setAge(profile.age ? profile.age.toString() : "");
      setGender(profile.gender || "");
    }
  }, [profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];

        const result = await uploadPhoto.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type,
          userType: "customer",
        });

        setProfilePhoto(result.url);
        toast.success("写真をアップロードしました");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error("アップロードに失敗しました");
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile.mutate({
      profilePhoto: profilePhoto || undefined,
      bio: bio || undefined,
      height: height ? parseInt(height) : undefined,
      weight: weight ? parseInt(weight) : undefined,
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
    });
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">プロフィール設定</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* プロフィール写真 */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="プロフィール"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                      <User className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      写真をアップロード
                    </Button>
                  </Label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-500 mt-2">最大5MB</p>
                </div>
              </div>

              {/* 自己紹介 */}
              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="簡単な自己紹介を入力してください"
                  rows={4}
                />
              </div>

              {/* 身長 */}
              <div className="space-y-2">
                <Label htmlFor="height">身長 (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                />
              </div>

              {/* 体重 */}
              <div className="space-y-2">
                <Label htmlFor="weight">体重 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="65"
                />
              </div>

              {/* 年齢 */}
              <div className="space-y-2">
                <Label htmlFor="age">年齢</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                />
              </div>

              {/* 性別 */}
              <div className="space-y-2">
                <Label htmlFor="gender">性別</Label>
                <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男性</SelectItem>
                    <SelectItem value="female">女性</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  保存
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
