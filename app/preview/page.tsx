"use client";

import { useEffect, useState, useRef } from "react";
import LivePreview from "@/components/LivePreview";
import ExportButtons from "@/components/ExportButtons";
import { GradientBackground } from "@/components/GradientBackground";
import gsap from "gsap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCode2, Home, Eye, Download } from "lucide-react";

export default function Preview() {
  const [data, setData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).__generatedData) {
      setData((window as any).__generatedData);
    }
  }, []);

  useEffect(() => {
    if (data && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );

      const cards = cardsRef.current.filter(Boolean);
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2,
          }
        );
      }
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col relative">
        <GradientBackground />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-background/95 backdrop-blur-xl shadow-2xl">
              <CardContent className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                  <Eye className="h-16 w-16 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  No Preview Available
                </h2>
                <p className="text-muted-foreground mb-6">
                  Generate a website first to see the preview here.
                </p>
                <Button asChild>
                  <a href="/">
                    <Home className="w-4 h-4" />
                    Go to Generator
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full relative">
      <GradientBackground />

      <div className="relative z-10 py-8 px-6">
        <div ref={containerRef} className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                Website Preview
              </h1>
              <p className="text-muted-foreground">
                Review your generated website
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <a href="/">← New Project</a>
              </Button>
              <ExportButtons files={data.files?.files || []} />
            </div>
          </div>

          {/* Preview Card */}
          <Card
            ref={(el) => {
              if (el) cardsRef.current[0] = el;
            }}
            className="bg-background/95 backdrop-blur-xl shadow-2xl"
          >
            <CardHeader>
              <CardTitle className="text-xl">Live Preview</CardTitle>
              <CardDescription>
                Your website rendered in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <LivePreview initial={data} />
              </div>
            </CardContent>
          </Card>

          {/* File Structure */}
          {data.files?.files && (
            <Card
              ref={(el) => {
                if (el) cardsRef.current[1] = el;
              }}
              className="bg-background/95 backdrop-blur-xl shadow-2xl"
            >
              <CardHeader>
                <CardTitle>File Structure</CardTitle>
                <CardDescription>
                  {data.files.files.length} files generated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.files.files.map((file: any, idx: number) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-card/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileCode2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium">
                            {file.path}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(file.content.length / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-primary hover:underline">
                          View content
                        </summary>
                        <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto max-h-40 font-mono">
                          {file.content.substring(0, 500)}
                          {file.content.length > 500 && "..."}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center pt-6">
            <Button asChild size="lg">
              <a href="/">
                <Home className="w-4 h-4" />
                Generate Another Website
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
