import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2, CheckCircle, Bell } from "lucide-react";
import { toast } from "sonner";

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notification.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success("すべての通知を既読にしました");
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
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

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">通知</h2>
              <p className="text-gray-600">
                あなたへの通知を確認できます
              </p>
            </div>
            {notifications && notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                すべて既読にする
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={`/consultations/${notification.relatedId}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <Card
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      !notification.isRead ? "border-l-4 border-l-primary bg-blue-50" : ""
                    }`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          notification.type === "best_answer" ? "bg-yellow-100" :
                          notification.type === "new_proposal" ? "bg-blue-100" :
                          "bg-red-100"
                        }`}>
                          <Bell className={`w-5 h-5 ${
                            notification.type === "best_answer" ? "text-yellow-600" :
                            notification.type === "new_proposal" ? "text-blue-600" :
                            "text-red-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{notification.title}</h4>
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs">新着</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.createdAt && new Date(notification.createdAt).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">通知はありません</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
