"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import Fuse from "fuse.js";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Printer,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  X,
  Search,
  ChevronsUpDown,
  Moon,
  Sun,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { CVData, Project } from "@/lib/types";

interface InteractiveCVProps {
  cvData: CVData;
  projects: Project[];
}

export function InteractiveCV({ cvData, projects }: InteractiveCVProps) {
  const { theme, setTheme } = useTheme();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    cvData.experience.forEach((exp) => {
      initial[exp.companyId] = true;
    });
    return initial;
  });
  const [showProjects, setShowProjects] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillComboOpen, setSkillComboOpen] = useState(false);
  const [revealedDetails, setRevealedDetails] = useState<
    Record<string, boolean>
  >({});

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(projects, {
      keys: [
        { name: "name", weight: 2 },
        { name: "description", weight: 1.5 },
        { name: "skills", weight: 1 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [projects]);

  const allSkills = useMemo(() => {
    return Array.from(new Set(projects.flatMap((p) => p.skills))).sort();
  }, [projects]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleReveal = (field: string) => {
    setRevealedDetails((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const obfuscateEmail = (email: string) => {
    const [local, domain] = email.split("@");
    return `${local.substring(0, 2)}${"•".repeat(Math.max(2, local.length - 2))}@${domain}`;
  };

  const obfuscatePhone = (phone: string) => {
    return phone.substring(0, 4) + "•".repeat(Math.max(2, phone.length - 4));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedCompany(null);
    setSearchQuery("");
  };

  const filteredProjects = useMemo(() => {
    let results = projects;

    // Apply search query using Fuse.js
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      results = searchResults.map((result) => result.item);
    }

    // Apply skill and company filters
    return results.filter((project) => {
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) => project.skills.includes(skill));
      const matchesCompany =
        !selectedCompany || project.companyId === selectedCompany;
      return matchesSkills && matchesCompany;
    });
  }, [projects, selectedSkills, selectedCompany, searchQuery, fuse]);

  const handlePrint = () => {
    // Use browser's native print with portrait orientation
    const style = document.createElement("style");
    style.textContent = "@page { size: portrait; margin: 0.5cm; }";
    document.head.appendChild(style);

    window.print();

    // Clean up
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const handleDownload = async () => {
    const element = document.querySelector(".mx-auto.max-w-\\[850px\\]");
    if (!element) return;

    try {
      // Dynamically import libraries to reduce initial bundle size
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Hide interactive elements temporarily
      const interactiveElements = element.querySelectorAll(
        ".print\\:hidden, button, .hover\\:text-foreground",
      );
      interactiveElements.forEach((el: Element) => {
        (el as HTMLElement).style.display = "none";
      });

      // Expand all sections
      const collapsedSections = element.querySelectorAll('[style*="max-h-0"]');
      collapsedSections.forEach((section: Element) => {
        (section as HTMLElement).style.maxHeight = "none";
        (section as HTMLElement).style.opacity = "1";
      });

      // Add temporary styling for better PDF capture
      const originalWidth = (element as HTMLElement).style.width;
      const originalPadding = (element as HTMLElement).style.padding;
      (element as HTMLElement).style.width = "850px";
      (element as HTMLElement).style.padding = "40px";

      // Create canvas from the CV element with higher quality
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 850,
        windowHeight: (element as HTMLElement).scrollHeight,
      });

      // Restore original styles and hidden elements
      (element as HTMLElement).style.width = originalWidth;
      (element as HTMLElement).style.padding = originalPadding;
      interactiveElements.forEach((el: Element) => {
        (el as HTMLElement).style.display = "";
      });
      collapsedSections.forEach((section: Element) => {
        (section as HTMLElement).style.maxHeight = "";
        (section as HTMLElement).style.opacity = "";
      });

      // Create PDF in portrait mode (A4 size)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10; // 10mm margin on all sides
      const contentWidth = pdfWidth - 2 * margin;

      // Calculate scaling to fit width
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // Calculate how many pages we need
      const pageContentHeight = pdfHeight - 2 * margin;
      const totalPages = Math.ceil(imgHeight / pageContentHeight);

      const imgData = canvas.toDataURL("image/png", 0.95);

      // Add pages with proper cropping
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the portion of the image to show on this page
        const sourceY =
          (page * pageContentHeight * canvas.width) / contentWidth;
        const sourceHeight = (pageContentHeight * canvas.width) / contentWidth;

        // Create a temporary canvas for this page's content
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sourceHeight, canvas.height - sourceY);

        const pageCtx = pageCanvas.getContext("2d");
        if (pageCtx) {
          // Draw the portion of the original canvas onto this page's canvas
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            canvas.width,
            pageCanvas.height,
          );

          // Add this page's image to the PDF
          const pageImgData = pageCanvas.toDataURL("image/png", 0.95);
          const pageImgHeight =
            (pageCanvas.height * contentWidth) / canvas.width;

          pdf.addImage(
            pageImgData,
            "PNG",
            margin,
            margin,
            contentWidth,
            pageImgHeight,
            undefined,
            "FAST",
          );
        }
      }

      // Download the PDF
      pdf.save("Kiran-Ojha-CV.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      // eslint-disable-next-line no-alert
      window.alert("Failed to generate PDF. Please try printing instead.");
    }
  };

  const hasActiveFilters =
    selectedSkills.length > 0 || selectedCompany || searchQuery.trim();

  // Helper function to highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts
      .map((part, index) =>
        part.toLowerCase() === query.toLowerCase()
          ? `<mark class="bg-yellow-200 text-foreground">${part}</mark>`
          : part,
      )
      .join("");
  };

  const { personal, companies, experience, skills, education } = cvData;

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gradient-to-br from-muted via-background to-muted py-8 px-4 print:bg-background print:py-0">
        {/* Floating Action Bar - Minimal Design */}
        <div
          className={`fixed top-4 right-4 flex gap-2 print:hidden z-50 transition-opacity duration-200 ${
            showProjects ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <Button
            variant={showProjects ? "default" : "outline"}
            size="sm"
            onClick={() => setShowProjects(!showProjects)}
            className="bg-background shadow-md hover:shadow-lg transition-shadow"
          >
            <Filter className="h-4 w-4 mr-2" />
            Projects
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-background shadow-md hover:shadow-lg transition-shadow"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print CV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 ml-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="ml-6">
                  {theme === "dark" ? "Light" : "Dark"} Mode
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mx-auto max-w-[850px] bg-background shadow-xl print:shadow-none rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="p-8 md:p-12">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-5xl font-cursive font-bold text-foreground mb-3">
                {personal.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <a
                  href={personal.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {personal.location.city}
                </a>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      <button
                        onClick={() => toggleReveal("phone")}
                        className="flex items-center gap-1 hover:text-foreground transition-colors print:before:content-[attr(data-phone)]"
                        data-phone={personal.phone}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span
                          className={`print:hidden ${!revealedDetails.phone ? "obfuscated" : ""}`}
                        >
                          {revealedDetails.phone
                            ? personal.phone
                            : obfuscatePhone(personal.phone)}
                        </span>
                        <span className="hidden print:inline">
                          {personal.phone}
                        </span>
                      </button>
                      {revealedDetails.phone && (
                        <button
                          onClick={() =>
                            copyToClipboard(personal.phone, "phone")
                          }
                          className="hover:text-foreground transition-colors print:hidden"
                        >
                          {copiedField === "phone" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {revealedDetails.phone
                      ? "Click to hide"
                      : "Click to reveal"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      <button
                        onClick={() => toggleReveal("email")}
                        className="flex items-center gap-1 hover:text-foreground transition-colors print:before:content-[attr(data-email)]"
                        data-email={personal.email}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span
                          className={`print:hidden ${!revealedDetails.email ? "obfuscated" : ""}`}
                        >
                          {revealedDetails.email
                            ? personal.email
                            : obfuscateEmail(personal.email)}
                        </span>
                        <span className="hidden print:inline">
                          {personal.email}
                        </span>
                      </button>
                      {revealedDetails.email && (
                        <>
                          <a
                            href={`mailto:${personal.email}`}
                            className="hover:text-foreground transition-colors print:hidden"
                            title="Send email"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            onClick={() =>
                              copyToClipboard(personal.email, "email")
                            }
                            className="hover:text-foreground transition-colors print:hidden"
                          >
                            {copiedField === "email" ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </>
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {revealedDetails.email
                      ? "Click to hide"
                      : "Click to reveal"}
                  </TooltipContent>
                </Tooltip>

                <a
                  href={personal.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  {personal.github.display}
                </a>
              </div>
            </header>

            {/* Work Experience */}
            <section className="mb-6">
              <h2 className="text-lg font-bold text-foreground border-b-2 border-foreground pb-1.5 mb-4 uppercase tracking-wider">
                Work Experience
              </h2>

              {experience.map((exp) => {
                const company = companies[exp.companyId];
                return (
                  <div key={exp.companyId} className="mb-5">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <div className="flex items-center flex-wrap gap-x-1">
                        <a
                          href={company.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                        >
                          {company.name}
                          <ExternalLink className="h-3 w-3 print:hidden" />
                        </a>
                        {company.type && (
                          <span className="text-muted-foreground text-sm">
                            ({company.type})
                          </span>
                        )}
                        <span className="text-muted-foreground text-sm ml-1">
                          {company.location}
                        </span>
                        <Badge
                          variant={
                            selectedCompany === exp.companyId
                              ? "default"
                              : "secondary"
                          }
                          className="ml-2 text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors print:hidden"
                          onClick={() => {
                            setSelectedCompany(
                              selectedCompany === exp.companyId
                                ? null
                                : exp.companyId,
                            );
                            setShowProjects(true);
                          }}
                        >
                          View Projects
                        </Badge>
                      </div>
                      <button
                        onClick={() => toggleSection(exp.companyId)}
                        className="text-muted-foreground print:hidden mt-1 p-1 hover:bg-muted rounded"
                        aria-label={
                          expandedSections[exp.companyId]
                            ? "Collapse section"
                            : "Expand section"
                        }
                      >
                        {expandedSections[exp.companyId] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap justify-between items-baseline gap-x-4 mb-2">
                      <p className="font-semibold text-foreground">
                        {exp.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exp.period}
                      </p>
                    </div>
                    <ul
                      className={`list-disc list-outside ml-5 space-y-1 text-sm text-foreground transition-all duration-300 overflow-hidden print:max-h-none print:opacity-100 ${
                        expandedSections[exp.companyId]
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {exp.responsibilities.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </section>

            {/* Core Skills */}
            <section className="mb-6">
              <h2 className="text-lg font-bold text-foreground border-b-2 border-foreground pb-1.5 mb-4 uppercase tracking-wider">
                Core Skills
              </h2>
              <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-foreground">
                {skills.map((skillGroup) => (
                  <li key={skillGroup.category}>
                    <span className="font-semibold">
                      {skillGroup.category}:
                    </span>{" "}
                    {skillGroup.items.join(", ")}
                  </li>
                ))}
              </ul>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-lg font-bold text-foreground border-b-2 border-foreground pb-1.5 mb-4 uppercase tracking-wider">
                Education
              </h2>

              {education.map((edu, index) => (
                <div
                  key={index}
                  className={index < education.length - 1 ? "mb-4" : ""}
                >
                  <div className="flex flex-wrap justify-between items-baseline gap-x-4">
                    <h3 className="font-bold text-foreground uppercase">
                      {edu.institution}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {edu.location}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between items-baseline gap-x-4">
                    <p className="font-semibold text-foreground">
                      {edu.degree}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {edu.period}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{edu.details}</p>
                </div>
              ))}
            </section>
          </div>
        </div>

        {/* Projects Panel - Slides in from right */}
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl transform transition-transform duration-300 ease-in-out print:hidden z-[60] ${
            showProjects ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="p-3 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold">Projects</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowProjects(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Minimal Mixed Filters */}
            <div className="p-3 border-b space-y-2">
              {/* Search + Clear */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs whitespace-nowrap"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Skills + Company in one row */}
              <div className="flex gap-2">
                {/* Skills Combobox */}
                <Popover open={skillComboOpen} onOpenChange={setSkillComboOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      role="combobox"
                      aria-expanded={skillComboOpen}
                      className="h-8 flex-1 justify-between text-xs font-normal"
                    >
                      <span className="truncate">
                        {selectedSkills.length > 0
                          ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""}`
                          : "Skills"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[280px] p-0 z-[70]"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search..." className="h-8" />
                      <CommandList>
                        <CommandEmpty>No skill found.</CommandEmpty>
                        <CommandGroup>
                          {allSkills.map((skill) => (
                            <CommandItem
                              key={skill}
                              value={skill}
                              onSelect={() => toggleSkill(skill)}
                              className="text-xs"
                            >
                              <div
                                className={`mr-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary ${
                                  selectedSkills.includes(skill)
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50"
                                }`}
                              >
                                {selectedSkills.includes(skill) && (
                                  <Check className="h-2.5 w-2.5" />
                                )}
                              </div>
                              <span>{skill}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Company Combobox */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 justify-between text-xs font-normal"
                    >
                      <span className="truncate">
                        {selectedCompany
                          ? companies[selectedCompany]?.name.split(" ")[0]
                          : "Company"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0 z-[70]" align="end">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => setSelectedCompany(null)}
                            className="text-xs"
                          >
                            <div
                              className={`mr-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary ${
                                !selectedCompany
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50"
                              }`}
                            >
                              {!selectedCompany && (
                                <Check className="h-2.5 w-2.5" />
                              )}
                            </div>
                            <span>All Companies</span>
                          </CommandItem>
                          {Object.values(companies).map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.name}
                              onSelect={() =>
                                setSelectedCompany(
                                  selectedCompany === company.id
                                    ? null
                                    : company.id,
                                )
                              }
                              className="text-xs"
                            >
                              <div
                                className={`mr-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary ${
                                  selectedCompany === company.id
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50"
                                }`}
                              >
                                {selectedCompany === company.id && (
                                  <Check className="h-2.5 w-2.5" />
                                )}
                              </div>
                              <span>{company.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Active Filters (chips) */}
              {(selectedSkills.length > 0 || selectedCompany) && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="h-5 text-[10px] px-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                      <X className="ml-1 h-2.5 w-2.5" />
                    </Badge>
                  ))}
                  {selectedCompany && (
                    <Badge
                      variant="secondary"
                      className="h-5 text-[10px] px-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setSelectedCompany(null)}
                    >
                      {companies[selectedCompany]?.name.split(" ")[0]}
                      <X className="ml-1 h-2.5 w-2.5" />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Results Counter */}
              {filteredProjects.length > 0 && (
                <div className="text-xs text-muted-foreground pb-2 border-b">
                  Showing {filteredProjects.length} of {projects.length} project
                  {projects.length !== 1 ? "s" : ""}
                </div>
              )}

              {filteredProjects.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Filter className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium mb-1">No projects found</p>
                  <p className="text-sm mb-4">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "Try adjusting your filters"}
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const CardWrapper = project.deployedUrl ? "a" : "div";
                  const cardProps = project.deployedUrl
                    ? {
                        href: project.deployedUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className:
                          "block border rounded-lg overflow-hidden hover:border-primary hover:shadow-lg transition-all cursor-pointer group",
                      }
                    : {
                        className: "border rounded-lg overflow-hidden",
                      };

                  return (
                    <CardWrapper key={project.id} {...cardProps}>
                      {/* Project Image */}
                      {project.image && (
                        <div className="relative w-full h-40 bg-muted overflow-hidden">
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {project.deployedUrl && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Project Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          {project.url && !project.deployedUrl && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {project.skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!selectedSkills.includes(skill)) {
                                    toggleSkill(skill);
                                  }
                                }}
                              >
                                {skill}
                              </Badge>
                            ))}
                            {project.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {project.year}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <Badge
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (selectedCompany !== project.companyId) {
                                setSelectedCompany(project.companyId);
                              }
                            }}
                          >
                            {companies[project.companyId]?.name.split(" ")[0]}
                          </Badge>
                        </div>
                      </div>
                    </CardWrapper>
                  );
                })
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t text-center text-xs text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>

        {/* Overlay when panel is open */}
        {showProjects && (
          <div
            className="fixed inset-0 bg-foreground/20 print:hidden z-30"
            onClick={() => setShowProjects(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowProjects(false)}
            role="button"
            tabIndex={0}
            aria-label="Close projects panel"
          />
        )}
      </main>
    </TooltipProvider>
  );
}
