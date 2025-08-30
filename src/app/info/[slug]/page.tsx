import React from "react";
import { DynamicPageContent } from "@/components/Explore/Info/dynamic-page-content";
import adminCatalogData from "@/components/Explore/Info/json/data.json";
import { DataInterface } from "@/components/Explore/Info/json/interfaceTsx";

export default function DynamicPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DynamicPageContent
          allData={adminCatalogData as unknown as DataInterface}
        />
      </div>
    </div>
  );
}
