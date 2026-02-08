import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import AIChatbot from "@/components/ai/AIChatbot";
import FeedbackAnalysis from "@/components/ai/FeedbackAnalysis";
import ContentGenerator from "@/components/ai/ContentGenerator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageCircle, BarChart3, PenTool } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Assistente de IA"
          subtitle="Chatbot, análise de feedback e geração de conteúdo automatizado"
          icon={Bot}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Chatbot Ativo</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">✓</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Análise Feedback</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">IA</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Gerador Conteúdo</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">ON</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chatbot" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chatbot" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chatbot
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Análise Feedback
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <PenTool className="w-4 h-4" />
              Gerador de Conteúdo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chatbot">
            <AIChatbot />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackAnalysis />
          </TabsContent>

          <TabsContent value="content">
            <ContentGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}