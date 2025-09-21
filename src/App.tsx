import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import PrivateRoute from "@/components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArticleDetail from "./pages/ArticleDetail";
import CreateArticle from "./pages/CreateArticle";
import Forum from "./pages/Forum";
import TopicDetail from "./pages/TopicDetail";
import CreateTopic from "./pages/CreateTopic";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/topics/:id" element={<TopicDetail />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              
              {/* Protected Routes */}
              <Route 
                path="/create-article" 
                element={
                  <PrivateRoute>
                    <CreateArticle />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/articles/:id/edit" 
                element={
                  <PrivateRoute>
                    <CreateArticle />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/forum/create-topic" 
                element={
                  <PrivateRoute>
                    <CreateTopic />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/forum/topics/:id/edit" 
                element={
                  <PrivateRoute>
                    <CreateTopic />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <PrivateRoute>
                    <EditProfile />
                  </PrivateRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
