import React from "react";
import { CSVImporterWizard } from "@/components/CSVImporterWizard";

/**
 * Main page component for the GrowEasy AI-Powered CSV Importer.
 * Render the Client-side wizard component directly within a Server Component context.
 */
export default function Home(): React.JSX.Element {
  return <CSVImporterWizard />;
}
