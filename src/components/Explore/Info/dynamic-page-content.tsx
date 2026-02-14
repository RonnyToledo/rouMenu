"use client";

import { useEffect, useState } from "react";
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
  {
    basePath: "/info",
    includeNoSlug: false,
  }
);
interface DynamicPageContentProps {
  allData: DataInterface;
}

export function DynamicPageContent({ allData }: DynamicPageContentProps) {
  const [activeSection, setActiveSection] = useState("");
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const [content, setContent] = useState<
    ContectDataInterace | SubsectionsInterace | null
  >();
  const [prevNextState, setPrevNextState] = useState<{
    index: number;
    prev: FlatItem | null;
    next: FlatItem | null;
  }>(getPrevNext(flat, "introduccion"));

  const params = useParams();
  const { slug } = params;

  if (!slug) notFound();

  // Search through sections and subsections
  useEffect(() => {
    for (const section of allData?.sections || ([] as ContectDataInterace[])) {
      if (section.slug === slug) {
        setContent(section);
        if (section.slug) {
          setActiveSection(section?.slug || "");
          setPrevNextState(getPrevNext(flat, section?.slug));
        }
        setBreadcrumb([section.title || ""]);
      }

      if (section.subsections) {
        for (const subsection of section.subsections) {
          if ((subsection?.slug || "") === slug) {
            setContent(subsection);
            if (!subsection.slug) {
              notFound();
            } else {
              setActiveSection(subsection?.slug || "");
              setPrevNextState(getPrevNext(flat, subsection?.slug));
            }
            setBreadcrumb([section.title || "", subsection.title || ""]);
            break;
          }
        }
      }
    }
  }, [allData?.sections, slug]);

  const renderImage = (imageData: ImageInterface) => {
    if (!imageData) return null;

    return (
      <div className="my-6">
        <Image
          width={500}
          height={500}
          src={imageData.url || `/placeholder.svg`}
          alt={imageData.alt || "Content image"}
          className="rounded-lg border shadow-sm max-w-full h-auto w-full aspect-video object-cover object-center"
        />
        {imageData.caption && (
          <p className="text-sm text-muted-foreground mt-2 text-center italic">
            {imageData.caption}
          </p>
        )}
      </div>
    );
  };

  const renderContentSection = (section: SectionsInterace) => {
    return (
      <div key={section.id} className="mb-8">
        {section.title && (
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {section.icon && (
              <span className="text-primary">{section.icon}</span>
            )}
            {section.title}
          </h3>
        )}

        {section.description && (
          <p className="text-muted-foreground mb-4">{section.description}</p>
        )}

        {section.image && renderImage(section.image)}

        {section.items && (
          <div className="space-y-3">
            {section.items.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  {item.title && <strong>{item.title}:</strong>}{" "}
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {section.cards && (
          <div className="grid gap-6 mt-6">
            {section.cards.map((card, index) => (
              <Card key={index} className={card.className || ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {card.icon && <span>{card.icon}</span>}
                    {card.title}
                  </CardTitle>
                  {card.description && (
                    <CardDescription>{card.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {card.image && renderImage(card.image)}
                  {card.content && (
                    <p className="text-sm text-muted-foreground">
                      {card.content}
                    </p>
                  )}
                  {card.items && (
                    <ul className="space-y-2 text-sm text-muted-foreground">
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
          <Alert className={`mt-6 ${section.alert.className || ""}`}>
            {section.alert.icon && (
              <span className="h-4 w-4">{section.alert.icon}</span>
            )}
            <AlertDescription>
              {section.alert.title && <strong>{section.alert.title}</strong>}
              {section.alert.description}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 p-6 ">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary ">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumb.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2 basis-2/5 ">
              <ChevronRight className="h-4 w-4" />
              <span
                className={
                  index === breadcrumb.length - 1
                    ? "text-foreground font-medium line-clamp-1"
                    : "hover:text-primary line-clamp-1"
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {content?.icon && <span className="text-2xl">{content?.icon}</span>}
            <h1 className="text-3xl font-bold">{content?.title}</h1>
          </div>
          {content?.description && (
            <p className="text-lg text-muted-foreground">
              {content?.description}
            </p>
          )}
          {content?.badges && (
            <div className="flex gap-2 mt-4">
              {content?.badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge?.variant || "secondary"}
                  className={badge.className}
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
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6">Enlaces Importantes</h3>
            <div className="grid gap-6">
              {(content?.links || ([] as LinkInterace[])).map(
                (link, index: number) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {link.icon && (
                          <span className="text-primary">{link.icon}</span>
                        )}
                        {link.title}
                      </CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className={
                          link.variant === "outline"
                            ? "w-full bg-transparent"
                            : "w-full"
                        }
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
                )
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col p-2 gap-2">
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
        onSectionChange={setActiveSection}
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
      className={`h-auto ${align ? "justify-start text-start mr-8 " : "justify-end text-end ml-8 "}`}
      variant={"outline"}
      onClick={() => router.push(link)}
    >
      <div
        className={`flex ${align ? "flex-row-reverse" : "flex-row"} items-center`}
      >
        <div>
          <h4 className="text-sm text-slate-600">{title}</h4>
          <h2 className="text-lg text-slate-900">{prevNextState?.title}</h2>
        </div>

        {align ? (
          <ChevronLeft className="size-8 text-slate-700" />
        ) : (
          <ChevronRight className="size-8 text-slate-700" />
        )}
      </div>
    </Button>
  );
}
