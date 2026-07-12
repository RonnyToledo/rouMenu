"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home } from "lucide-react";
import { StepByStepSheet } from "./step-by-step-sheet";
import Link from "next/link";
import {
  ContectDataInterace,
  DataInterface,
  ImageInterface,
  LinkInterace,
  SectionsInterace,
  SubsectionsInterace,
} from "./json/interfaceTsx";
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { flattenSections } from "@/lib/flatitem";
import { getPrevNext } from "@/lib/prevNext";
import { FlatItem } from "@/lib/types";
import adminCatalogData from "@/components/Explore/Info/json/data.json";
import { ChevronLeft, ChevronRight } from "lucide-react";

const flat = flattenSections(
  (adminCatalogData as unknown as DataInterface)?.sections || [],
  { basePath: "/info", includeNoSlug: false },
);

interface DynamicPageContentProps {
  allData: DataInterface;
}

export function DynamicPageContent({ allData }: DynamicPageContentProps) {
  const params = useParams();
  const { slug } = params;
  if (!slug) notFound();

  const { content, activeSection, prevNextState, breadcrumb } = useMemo(() => {
    let contentResult: ContectDataInterace | SubsectionsInterace | null = null;
    let activeSectionResult = "";
    let breadcrumbResult: string[] = [];
    let prevNextResult = getPrevNext(flat, "introduccion");

    for (const section of allData?.sections || []) {
      if (section.slug === slug) {
        contentResult = section;
        activeSectionResult = section.slug || "";
        prevNextResult = getPrevNext(flat, section.slug || "");
        breadcrumbResult = [section.title || ""];
        break;
      }
      if (section.subsections) {
        const foundSub = section.subsections.find((sub) => sub.slug === slug);
        if (foundSub) {
          contentResult = foundSub;
          activeSectionResult = foundSub.slug || "";
          prevNextResult = getPrevNext(flat, foundSub.slug || "");
          breadcrumbResult = [section.title || "", foundSub.title || ""];
          break;
        }
      }
    }
    return {
      content: contentResult,
      activeSection: activeSectionResult,
      breadcrumb: breadcrumbResult,
      prevNextState: prevNextResult,
    };
  }, [allData?.sections, slug]);

  const renderImage = (imageData: ImageInterface) => {
    if (!imageData) return null;
    return (
      <div className="my-5">
        <Image
          width={500}
          height={500}
          src={imageData.url || "/placeholder.svg"}
          alt={imageData.alt || "Content image"}
          className="rounded-xl border border-border max-w-full h-auto w-full aspect-video object-cover"
        />
        {imageData.caption && (
          <p className="text-xs text-muted-foreground mt-1.5 text-center italic">
            {imageData.caption}
          </p>
        )}
      </div>
    );
  };

  const renderContentSection = (section: SectionsInterace) => (
    <div key={section.id} className="mb-7">
      {section.title && (
        <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
          {section.icon && <span className="text-primary">{section.icon}</span>}
          {section.title}
        </h3>
      )}
      {section.description && (
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {section.description}
        </p>
      )}
      {section.image && renderImage(section.image)}
      {section.items && (
        <div className="space-y-2">
          {section.items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <div className="text-sm text-foreground">
                {item.title && (
                  <strong className="text-foreground">{item.title}: </strong>
                )}
                <span className="text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {section.cards && (
        <div className="grid gap-4 mt-4">
          {section.cards.map((card, index) => (
            <Card
              key={index}
              className={`border-border ${card.className || ""}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-foreground">
                  {card.icon && <span>{card.icon}</span>}
                  {card.title}
                </CardTitle>
                {card.description && (
                  <CardDescription className="text-xs">
                    {card.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {card.image && renderImage(card.image)}
                {card.content && (
                  <p className="text-xs text-muted-foreground">
                    {card.content}
                  </p>
                )}
                {card.items && (
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {card.items.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {section.alert && (
        <Alert
          className={`mt-4 border-border ${section.alert.className || ""}`}
        >
          {section.alert.icon && (
            <span className="h-4 w-4">{section.alert.icon}</span>
          )}
          <AlertDescription className="text-sm">
            {section.alert.title && (
              <strong className="text-foreground">{section.alert.title}</strong>
            )}
            <span className="text-muted-foreground">
              {section.alert.description}
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
          <Link href="/" className="hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {breadcrumb.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span
                className={`line-clamp-1 ${index === breadcrumb.length - 1 ? "text-foreground font-medium" : "hover:text-foreground"}`}
              >
                {crumb}
              </span>
            </div>
          ))}
        </nav>

        <div className="mb-7">
          <div className="flex items-center gap-2.5 mb-2">
            {content?.icon && <span className="text-xl">{content?.icon}</span>}
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {content?.title}
            </h1>
          </div>
          {content?.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {content?.description}
            </p>
          )}
          {content?.badges && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {content?.badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge?.variant || "secondary"}
                  className={`rounded-full text-xs ${badge.className || ""}`}
                >
                  {badge.icon && <span className="mr-1">{badge.icon}</span>}
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {content?.heroImage && renderImage(content?.heroImage)}
        {content?.sections && content?.sections.map(renderContentSection)}

        {content?.links && (
          <div className="mt-10">
            <h3 className="font-serif text-lg font-semibold mb-4 text-foreground">
              Enlaces Importantes
            </h3>
            <div className="grid gap-4">
              {(content?.links || ([] as LinkInterace[])).map((link, index) => (
                <Card
                  key={index}
                  className="border-border hover:shadow-sm transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm text-foreground">
                      {link.icon && (
                        <span className="text-primary">{link.icon}</span>
                      )}
                      {link.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {link.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className={`w-full rounded-full active:scale-[0.98] transition-all ${link.variant === "outline" ? "bg-transparent" : ""}`}
                      variant={link?.variant || "default"}
                      asChild
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.buttonText}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col p-2 gap-2 max-w-4xl mx-auto mt-6">
        {prevNextState.prev && (
          <ButtonPrevNext
            title="Anterior"
            prevNextState={prevNextState.prev}
            link={prevNextState.prev.path}
          />
        )}
        {prevNextState.next && (
          <ButtonPrevNext
            title="Siguiente"
            prevNextState={prevNextState.next}
            link={prevNextState.next.path}
            align={false}
          />
        )}
      </div>

      <StepByStepSheet
        data={allData}
        activeSection={activeSection}
        onSectionChange={() => {}}
      />
    </main>
  );
}

function ButtonPrevNext({
  prevNextState,
  title,
  link,
  align = true,
}: {
  prevNextState: FlatItem;
  title: string;
  link: string;
  align?: boolean;
}) {
  const router = useRouter();
  return (
    <Button
      className={`h-auto rounded-xl border-border ${align ? "justify-start text-start mr-8" : "justify-end text-end ml-8"}`}
      variant="outline"
      onClick={() => router.push(link)}
    >
      <div
        className={`flex ${align ? "flex-row-reverse" : "flex-row"} items-center gap-2`}
      >
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-sm font-medium text-foreground">
            {prevNextState?.title}
          </p>
        </div>
        {align ? (
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
    </Button>
  );
}
