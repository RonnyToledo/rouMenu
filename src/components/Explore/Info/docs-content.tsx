import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Info } from "lucide-react";

export function DocsContent() {
  return (
    <main className="flex-1 p-4">
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Docs</span>
          <span>/</span>
          <span>Getting Started</span>
          <span>/</span>
          <span className="text-foreground">Installation</span>
        </div>

        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">Installation</h1>
            <Badge variant="secondary">v14.0</Badge>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Get started with Next.js by creating a new application or adding it
            to an existing project.
          </p>
        </div>

        {/* Quick Start Alert */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>New to Next.js?</strong> We recommend starting with our{" "}
            <a href="#" className="text-primary hover:underline">
              Learn Next.js course
            </a>{" "}
            for a guided introduction.
          </AlertDescription>
        </Alert>

        {/* System Requirements */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            System Requirements
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Node.js 18.17 or later
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              macOS, Windows (including WSL), and Linux are supported
            </li>
          </ul>
        </section>

        {/* Automatic Installation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Automatic Installation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We recommend starting a new Next.js app using{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm">
              create-next-app
            </code>
            , which sets up everything automatically for you.
          </p>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Terminal
                </span>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="bg-card text-card-foreground p-4 rounded-lg overflow-x-auto">
                <code>{`npx create-next-app@latest my-app
cd my-app
npm run dev`}</code>
              </pre>
            </CardContent>
          </Card>

          <p className="text-muted-foreground leading-relaxed">
            After the installation is complete, follow the instructions to start
            the development server. Try editing{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm">
              app/page.tsx
            </code>{" "}
            and save to see the result in your browser.
          </p>
        </section>

        {/* Manual Installation */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Manual Installation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To manually create a new Next.js app, install the required packages:
          </p>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Terminal
                </span>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Next Steps */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Next Steps</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">Project Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn about the files and folders in your Next.js project.
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">Routing</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first route using the App Router.
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
