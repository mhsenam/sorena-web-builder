"use client";

import { useState, useEffect, useRef } from "react";
import ModernLivePreview from "@/components/ModernLivePreview";
import gsap from "gsap";
import ExportButtons from "@/components/ExportButtons";
import { GradientBackground } from "@/components/GradientBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }

    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: "power3.out" }
      );
    }
  }, []);

  const handleResult = (data: any) => {
    setGeneratedData(data);
    if (typeof window !== "undefined") {
      (window as any).__generatedData = data;
    }
  };

  const handleQuickGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Navigate to preview immediately to show loading state
    const loadingData = {
      plan: { meta: { title: "Generating...", description: prompt } },
      files: { files: [] },
      isLoading: true,
    };
    handleResult(loadingData);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: prompt,
          framework: "vanilla",
          theme: {
            primary: "#6B46C1",
            secondary: "#EC4899",
            font: "Inter",
            dark: false,
          },
          sections: ["hero", "features", "contact"],
          language: "en",
          brand: {
            name: "Generated Site",
            tone: "casual",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);

        // Handle validation errors specifically
        if (errorData.details && Array.isArray(errorData.details)) {
          const messages = errorData.details
            .map((d: any) => d.message)
            .join(", ");
          throw new Error(`Validation error: ${messages}`);
        }

        throw new Error(errorData.error || "Failed to generate site");
      }

      const data = await response.json();
      handleResult({ ...data, isLoading: false });
    } catch (error: any) {
      console.error("Generation error:", error);
      setGeneratedData(null);

      // Show more specific error message
      const errorMessage = error.message || "Failed to generate website";
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedData) {
    return (
      <div className="min-h-screen w-full">
        <GradientBackground />
        <div className="relative z-10 p-8">
          {/* Navigation Bar */}
          <div className="mb-6">
            {/* Action Buttons Below Navbar */}
            {!generatedData.isLoading && (
              <div className="mt-4 flex justify-center">
                <ExportButtons files={generatedData.files?.files || []} />
              </div>
            )}
          </div>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-2xl">
            <CardContent className="p-0">
              {generatedData.isLoading ? (
                <div className="p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    Creating your website...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This may take a few moments
                  </p>
                </div>
              ) : (
                <ModernLivePreview initial={generatedData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <GradientBackground />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div ref={headerRef} className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              Build something{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Create apps and websites by chatting with AI
            </p>
          </div>

          {/* Input Form */}
          <div ref={formRef} className="w-full">
            <Card className="border-0 shadow-2xl bg-background/95 backdrop-blur-xl">
              <CardContent className="p-2">
                <div className="flex items-stretch gap-2">
                  <Textarea
                    placeholder="Ask Sorina to create a landing page for my..."
                    value={prompt}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, 2000);
                      setPrompt(newValue);

                      // Auto-resize logic
                      const target = e.target as HTMLTextAreaElement;
                      if (newValue === "") {
                        // Reset to initial height when cleared
                        target.style.height = "60px";
                      } else {
                        target.style.height = "60px";
                        const scrollHeight = target.scrollHeight;
                        const newHeight = Math.min(
                          Math.max(60, scrollHeight),
                          300
                        );
                        requestAnimationFrame(() => {
                          target.style.height = `${newHeight}px`;
                        });
                      }
                    }}
                    maxLength={2000}
                    className="flex-1 min-h-[60px] max-h-[300px] overflow-y-auto resize-none border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
                    style={{
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      backgroundColor: "transparent",
                      height: "60px",
                      transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    rows={1}
                    onFocus={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      if (target.value) {
                        target.style.height = "60px";
                        const scrollHeight = target.scrollHeight;
                        const newHeight = Math.min(
                          Math.max(60, scrollHeight),
                          300
                        );
                        target.style.height = `${newHeight}px`;
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleQuickGenerate();
                      }
                    }}
                  />
                  <Button
                    onClick={handleQuickGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    size="lg"
                    className="self-end mb-2"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between gap-2 px-4 pb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Sparkles className="w-4 h-4" />
                    Public
                  </Button>
                  {prompt.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {prompt.length}/2000
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
