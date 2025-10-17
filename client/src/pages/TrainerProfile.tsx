import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Upload, Twitter, Instagram, Facebook, Youtube, Globe, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";


interface Certification {
  name: string;
  issuer: string;
  year: string;
}

interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
}

export default function TrainerProfile() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profile, isLoading } = trpc.trainer.getProfile.useQuery(
    { userId: user?.id || "" },
    { enabled: !!user?.id }
  );
  
  const [isTrainer, setIsTrainer] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [bio, setBio] = useState("");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([
    { name: "", issuer: "", year: "" }
  ]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

  useEffect(() => {
    if (user) {
      setIsTrainer(user.userType === "trainer");
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfilePhoto(profile.profilePhoto || "");
      setBio(profile.bio || "");
      setSpecialties(profile.specialties ? JSON.parse(profile.specialties) : []);
      setCertifications(
        profile.certifications 
          ? JSON.parse(profile.certifications)
          : [{ name: "", issuer: "", year: "" }]
      );
      setSocialLinks(profile.socialLinks ? JSON.parse(profile.socialLinks) : {});
    }
  }, [profile]);

  const saveMutation = trpc.trainer.createOrUpdateProfile.useMutation({
    onSuccess: () => {
      toast.success("プロフィールを保存しました");
      utils.trainer.getProfile.invalidate({ userId: user?.id || "" });
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error("エラーが発生しました: " + error.message);
    },
  });

  const updateUserTypeMutation = trpc.trainer.updateUserType.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const uploadMutation = trpc.storage.uploadProfilePhoto.useMutation({
    onSuccess: (data) => {
      setProfilePhoto(data.url);
      toast.success("写真をアップロードしました");
      setUploadingPhoto(false);
    },
    onError: (error) => {
      toast.error("アップロードに失敗しました: " + error.message);
      setUploadingPhoto(false);
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("画像ファイルを選択してください");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        uploadMutation.mutate({
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("アップロードに失敗しました");
      setUploadingPhoto(false);
    }
  };

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput("");
    }
  };

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    setSpecialties(specialties.filter(s => s !== specialtyToRemove));
  };

  const handleAddCertification = () => {
    setCertifications([...certifications, { name: "", issuer: "", year: "" }]);
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, idx) => idx !== index));
  };

  const handleUpdateCertification = (index: number, field: keyof Certification, value: string) => {
    const newCertifications = [...certifications];
    newCertifications[index][field] = value;
    setCertifications(newCertifications);
  };

  const handleUpdateSocialLink = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks({ ...socialLinks, [platform]: value });
  };

  const handleTrainerToggle = (checked: boolean) => {
    setIsTrainer(checked);
    if (checked && user?.userType !== "trainer") {
      updateUserTypeMutation.mutate({ userType: "trainer" });
    } else if (!checked && user?.userType === "trainer") {
      updateUserTypeMutation.mutate({ userType: "customer" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validCertifications = certifications.filter(cert => 
      cert.name.trim() && cert.issuer.trim() && cert.year.trim()
    );

    const validSocialLinks = Object.fromEntries(
      Object.entries(socialLinks).filter(([_, value]) => value && value.trim())
    );

    saveMutation.mutate({
      profilePhoto: profilePhoto.trim() || undefined,
      bio: bio.trim() || undefined,
      specialties: specialties.length > 0 ? specialties : undefined,
      certifications: validCertifications.length > 0 ? validCertifications : undefined,
      socialLinks: Object.keys(validSocialLinks).length > 0 ? validSocialLinks as SocialLinks : undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>プロフィールを編集するにはログインしてください</CardDescription>
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
            <Link href="/create-consultation">
              <Button variant="outline">相談を投稿</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">トレーナープロフィール</CardTitle>
            <CardDescription>
              あなたの専門性や資格情報を登録して、相談者にアピールしましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trainer Registration Toggle */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="isTrainer"
                      checked={isTrainer}
                      onCheckedChange={handleTrainerToggle}
                      disabled={updateUserTypeMutation.isPending}
                    />
                    <div className="flex-1">
                      <Label htmlFor="isTrainer" className="text-base font-semibold cursor-pointer">
                        トレーナーとして登録する
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        トレーナーとして登録すると、管理者の承認後に相談への回答が可能になります。
                      </p>
                    </div>
                  </div>
                  {isTrainer && !user?.isApprovedTrainer && (
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        トレーナー承認待ちです。管理者による承認が完了すると、相談への回答が可能になります。
                      </AlertDescription>
                    </Alert>
                  )}
                  {isTrainer && user?.isApprovedTrainer && (
                    <Alert className="mt-3 border-green-200 bg-green-50">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        トレーナーとして承認されています。相談への回答が可能です。
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Profile Photo */}
                <div>
                  <Label>プロフィール写真</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            アップロード中...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            写真を選択
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, GIF (最大5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">自己紹介</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="あなたの経歴、指導方針、得意分野などを記載してください"
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="specialties">専門分野</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="specialties"
                      value={specialtyInput}
                      onChange={(e) => setSpecialtyInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSpecialty();
                        }
                      }}
                      placeholder="専門分野を入力してEnterキーで追加"
                    />
                    <Button type="button" onClick={handleAddSpecialty} variant="outline">
                      追加
                    </Button>
                  </div>
                  {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty, idx) => (
                        <div
                          key={idx}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {specialty}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialty(specialty)}
                            className="hover:text-primary/70"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div>
                  <Label className="text-lg mb-4 block">SNSリンク</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <Input
                        value={socialLinks.twitter || ""}
                        onChange={(e) => handleUpdateSocialLink('twitter', e.target.value)}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-pink-500" />
                      <Input
                        value={socialLinks.instagram || ""}
                        onChange={(e) => handleUpdateSocialLink('instagram', e.target.value)}
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <Input
                        value={socialLinks.facebook || ""}
                        onChange={(e) => handleUpdateSocialLink('facebook', e.target.value)}
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Youtube className="w-5 h-5 text-red-600" />
                      <Input
                        value={socialLinks.youtube || ""}
                        onChange={(e) => handleUpdateSocialLink('youtube', e.target.value)}
                        placeholder="https://youtube.com/@username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <Input
                        value={socialLinks.website || ""}
                        onChange={(e) => handleUpdateSocialLink('website', e.target.value)}
                        placeholder="https://your-website.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg">資格・認定</Label>
                    <Button type="button" onClick={handleAddCertification} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      資格を追加
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {certifications.map((cert, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <Label>資格名</Label>
                                <Input
                                  value={cert.name}
                                  onChange={(e) => handleUpdateCertification(index, 'name', e.target.value)}
                                  placeholder="例: NSCA-CPT"
                                />
                              </div>
                              {certifications.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveCertification(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="mt-6"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <Label>発行機関</Label>
                                <Input
                                  value={cert.issuer}
                                  onChange={(e) => handleUpdateCertification(index, 'issuer', e.target.value)}
                                  placeholder="例: NSCA"
                                />
                              </div>
                              <div>
                                <Label>取得年</Label>
                                <Input
                                  value={cert.year}
                                  onChange={(e) => handleUpdateCertification(index, 'year', e.target.value)}
                                  placeholder="例: 2020"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {profile && !profile.isVerified && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>認証待ち:</strong> 資格証明書の確認が完了すると、認証バッジが表示されます。
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? "保存中..." : "プロフィールを保存"}
                </Button>
              </form>
            )}
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

