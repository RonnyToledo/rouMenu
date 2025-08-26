import { ChevronRight, Book, Code, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HiMiniBars3BottomRight } from "react-icons/hi2";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
export function DocsSidebar() {
  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" className="p-0 m-0">
          <HiMiniBars3BottomRight className="size-6 text-gray-700 " />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full py-6 px-4">
          <nav className="space-y-2">
            <div className="pb-2">
              <h4 className="mb-2 px-2 text-sm font-semibold text-sidebar-foreground">
                Getting Started
              </h4>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <Book className="mr-2 h-4 w-4" />
                  Installation
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Quick Start
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configuration
                </Button>
              </div>
            </div>

            <div className="pb-2">
              <h4 className="mb-2 px-2 text-sm font-semibold text-sidebar-foreground">
                Core Concepts
              </h4>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  App Router
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Pages & Layouts
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Server Components
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Client Components
                </Button>
              </div>
            </div>

            <div className="pb-2">
              <h4 className="mb-2 px-2 text-sm font-semibold text-sidebar-foreground">
                API Reference
              </h4>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <Code className="mr-2 h-4 w-4" />
                  Functions
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <Code className="mr-2 h-4 w-4" />
                  Components
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <Code className="mr-2 h-4 w-4" />
                  File Conventions
                </Button>
              </div>
            </div>

            <div className="pb-2">
              <h4 className="mb-2 px-2 text-sm font-semibold text-sidebar-foreground">
                Deployment
              </h4>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Static Exports
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8 px-2"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Vercel Platform
                </Button>
              </div>
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
