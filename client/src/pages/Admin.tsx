import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const approveMutation = trpc.admin.approveTrainer.useMutation({
    onSuccess: () => {
      toast.success("トレーナーを承認しました");
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error("エラーが発生しました: " + error.message);
    },
  });

  const revokeMutation = trpc.admin.revokeTrainer.useMutation({
    onSuccess: () => {
      toast.success("承認を取り消しました");
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error("エラーが発生しました: " + error.message);
    },
  });

  const changeUserTypeMutation = trpc.admin.changeUserType.useMutation({
    onSuccess: () => {
      toast.success("ユーザータイプを変更しました");
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error("エラーが発生しました: " + error.message);
    },
  });

  const handleApprove = (userId: string) => {
    if (confirm("このユーザーをトレーナーとして承認しますか?")) {
      approveMutation.mutate({ userId });
    }
  };

  const handleRevoke = (userId: string) => {
    if (confirm("このユーザーのトレーナー承認を取り消しますか?")) {
      revokeMutation.mutate({ userId });
    }
  };

  const handleChangeUserType = (userId: string, newType: "customer" | "trainer") => {
    const message = newType === "trainer" 
      ? "このユーザーをトレーナーに変更しますか?"
      : "このユーザーを一般顧客に変更しますか?";
    if (confirm(message)) {
      changeUserTypeMutation.mutate({ userId, userType: newType });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>管理画面にアクセスするにはログインしてください</CardDescription>
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>アクセス権限がありません</CardTitle>
            <CardDescription>この画面は管理者のみアクセスできます</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">管理画面</h2>
          <p className="text-gray-600">
            ユーザー管理とトレーナー承認を行います
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ユーザー一覧</CardTitle>
            <CardDescription>
              全ユーザーの管理とトレーナー承認を行えます
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>メール</TableHead>
                    <TableHead>ユーザータイプ</TableHead>
                    <TableHead>トレーナー承認</TableHead>
                    <TableHead>ロール</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name || "未設定"}</TableCell>
                      <TableCell>{u.email || "未設定"}</TableCell>
                      <TableCell>
                        <Badge variant={u.userType === "trainer" ? "default" : "secondary"}>
                          {u.userType === "trainer" ? "トレーナー" : "一般顧客"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.isApprovedTrainer ? (
                          <Badge variant="default" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            承認済み
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            未承認
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "destructive" : "outline"}>
                          {u.role === "admin" ? "管理者" : "一般"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ja-JP') : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {u.role !== "admin" && (
                            <>
                              {u.userType === "customer" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleChangeUserType(u.id, "trainer")}
                                  disabled={changeUserTypeMutation.isPending}
                                >
                                  トレーナーに変更
                                </Button>
                              ) : (
                                <>
                                  {u.isApprovedTrainer ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRevoke(u.id)}
                                      disabled={revokeMutation.isPending}
                                    >
                                      承認取消
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(u.id)}
                                      disabled={approveMutation.isPending}
                                    >
                                      承認
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleChangeUserType(u.id, "customer")}
                                    disabled={changeUserTypeMutation.isPending}
                                  >
                                    顧客に戻す
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">ユーザーがいません</p>
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

