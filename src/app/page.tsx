import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Library, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Nano Banana
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            AI-Powered Image Editor
          </p>
          <p className="text-lg text-white/80 mt-4 max-w-xl mx-auto">
            Upload, edit, and transform your images with the power of AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          <Link href="/editor">
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-orange-400 to-red-500 group-hover:from-orange-500 group-hover:to-red-600 transition-colors">
                  <Edit size={48} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Editor</CardTitle>
                <CardDescription className="text-white/80 text-lg">
                  Upload and edit images with Fal AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white">
                  Start Editing
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/editor-openrouter">
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:from-yellow-500 group-hover:to-orange-600 transition-colors">
                  <Zap size={48} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Editor OpenRouter (Free)</CardTitle>
                <CardDescription className="text-white/80 text-lg">
                  Chat with AI about your images for free
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white">
                  Chat with AI
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/library">
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 group-hover:from-green-500 group-hover:to-blue-600 transition-colors">
                  <Library size={48} className="text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Library</CardTitle>
                <CardDescription className="text-white/80 text-lg">
                  View and manage your edited images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white">
                  View Library
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
