import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("ログアウトしました");
      utils.auth.me.invalidate();
      setLocation("/");
    },
    onError: (error) => {
      toast.error("ログアウトに失敗しました: " + error.message);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary cursor-pointer">{APP_TITLE}</h1>
        </Link>
        <nav className="flex gap-4 items-center">
          <Link href="/consultations">
            <Button variant="ghost">相談一覧</Button>
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/create-consultation">
                <Button variant="outline">相談を投稿</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.name || "ユーザー"}
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/trainer-profile">
                    <DropdownMenuItem>
                      プロフィール設定
                    </DropdownMenuItem>
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <DropdownMenuItem>
                        管理画面
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                    <LogOut className="mr-2 h-4 w-4" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <a href={getLoginUrl()}>
              <Button>ログイン</Button>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

