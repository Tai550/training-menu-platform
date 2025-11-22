import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ConsultationList from "./pages/ConsultationList";
import ConsultationDetail from "./pages/ConsultationDetail";
import CreateConsultation from "./pages/CreateConsultation";
import CreateProposal from "./pages/CreateProposal";
import EditProposal from "./pages/EditProposal";
import UserProfile from "./pages/UserProfile";
import TrainerProfile from "./pages/TrainerProfile";
import TrainerPublicProfile from "./pages/TrainerPublicProfile";
import Admin from "./pages/Admin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/consultations" component={ConsultationList} />
      <Route path="/consultations/:id" component={ConsultationDetail} />
      <Route path="/create-consultation" component={CreateConsultation} />
      <Route path="/consultations/:consultationId/propose" component={CreateProposal} />
      <Route path="/proposals/:proposalId/edit" component={EditProposal} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/trainer-profile" component={TrainerProfile} />
      <Route path="/trainer/:id" component={TrainerPublicProfile} />
      <Route path="/admin" component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
