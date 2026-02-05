"use client"

import { useState, useMemo } from "react"
import { Mail, Phone, MapPin, Github, Printer, Download, Copy, Check, ChevronDown, ChevronUp, ExternalLink, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

import type { CVData, Project } from "@/lib/types"

interface InteractiveCVProps {
  cvData: CVData
  projects: Project[]
}

export function InteractiveCV({ cvData, projects }: InteractiveCVProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    cvData.experience.forEach(exp => {
      initial[exp.companyId] = true
    })
    return initial
  })
  const [showProjects, setShowProjects] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  const allSkills = useMemo(() => {
    return Array.from(new Set(projects.flatMap(p => p.skills))).sort()
  }, [projects])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const clearFilters = () => {
    setSelectedSkills([])
    setSelectedCompany(null)
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSkills = selectedSkills.length === 0 || 
        selectedSkills.some(skill => project.skills.includes(skill))
      const matchesCompany = !selectedCompany || project.companyId === selectedCompany
      return matchesSkills && matchesCompany
    })
  }, [projects, selectedSkills, selectedCompany])

  const handlePrint = () => {
    window.print()
  }

  const hasActiveFilters = selectedSkills.length > 0 || selectedCompany

  const { personal, companies, experience, skills, education } = cvData

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-muted py-8 px-4 print:bg-background print:py-0">
        {/* Floating Action Bar */}
        <div className="fixed top-4 right-4 flex gap-2 print:hidden z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showProjects ? "default" : "outline"}
                size="sm"
                onClick={() => setShowProjects(!showProjects)}
                className="bg-background shadow-md"
              >
                <Filter className="h-4 w-4 mr-2" />
                Projects
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Projects Panel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                className="bg-background shadow-md"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Print CV</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                className="bg-background shadow-md"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as PDF</TooltipContent>
          </Tooltip>
        </div>

        <div className="mx-auto max-w-[850px] bg-background shadow-lg print:shadow-none">
          <div className="p-8 md:p-12">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-4xl font-cursive text-foreground mb-2">{personal.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={personal.location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {personal.location.city}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>View on Google Maps</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => copyToClipboard(personal.phone, "phone")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                    >
                      {copiedField === "phone" ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Phone className="h-3.5 w-3.5" />
                      )}
                      {personal.phone}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copiedField === "phone" ? "Copied!" : "Click to copy"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      <a 
                        href={`mailto:${personal.email}`}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {personal.email}
                      </a>
                      <button
                        onClick={() => copyToClipboard(personal.email, "email")}
                        className="hover:text-foreground transition-colors print:hidden"
                      >
                        {copiedField === "email" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Click email to send, or copy icon to copy</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href={personal.github.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Github className="h-3.5 w-3.5" />
                      {personal.github.display}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>View GitHub Profile</TooltipContent>
                </Tooltip>
              </div>
            </header>

            {/* Work Experience */}
            <section className="mb-6">
              <h2 className="text-lg font-bold text-foreground border-b border-foreground pb-1 mb-4 uppercase tracking-wide">
                Work Experience
              </h2>

              {experience.map((exp) => {
                const company = companies[exp.companyId]
                return (
                  <div key={exp.companyId} className="mb-5">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <div className="flex items-center flex-wrap gap-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={company.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                            >
                              {company.name}
                              <ExternalLink className="h-3 w-3 print:hidden" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>Visit company website</TooltipContent>
                        </Tooltip>
                        {company.type && (
                          <span className="text-muted-foreground text-sm">({company.type})</span>
                        )}
                        <span className="text-muted-foreground text-sm ml-1">{company.location}</span>
                        <Badge 
                          variant={selectedCompany === exp.companyId ? "default" : "secondary"} 
                          className="ml-2 text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors print:hidden"
                          onClick={() => {
                            setSelectedCompany(selectedCompany === exp.companyId ? null : exp.companyId)
                            setShowProjects(true)
                          }}
                        >
                          View Projects
                        </Badge>
                      </div>
                      <button
                        onClick={() => toggleSection(exp.companyId)}
                        className="text-muted-foreground print:hidden mt-1 p-1 hover:bg-muted rounded"
                        aria-label={expandedSections[exp.companyId] ? "Collapse section" : "Expand section"}
                      >
                        {expandedSections[exp.companyId] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap justify-between items-baseline gap-x-4 mb-2">
                      <p className="font-semibold text-foreground">{exp.title}</p>
                      <p className="text-sm text-muted-foreground">{exp.period}</p>
                    </div>
                    <ul 
                      className={`list-disc list-outside ml-5 space-y-1 text-sm text-foreground transition-all duration-300 overflow-hidden print:max-h-none print:opacity-100 ${
                        expandedSections[exp.companyId] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {exp.responsibilities.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </section>

            {/* Core Skills */}
            <section className="mb-6">
              <h2 className="text-lg font-bold text-foreground border-b border-foreground pb-1 mb-4 uppercase tracking-wide">
                Core Skills
              </h2>
              <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-foreground">
                {skills.map((skillGroup) => (
                  <li key={skillGroup.category}>
                    <span className="font-semibold">{skillGroup.category}:</span>{" "}
                    {skillGroup.items.join(", ")}
                  </li>
                ))}
              </ul>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-lg font-bold text-foreground border-b border-foreground pb-1 mb-4 uppercase tracking-wide">
                Education
              </h2>

              {education.map((edu, index) => (
                <div key={index} className={index < education.length - 1 ? "mb-4" : ""}>
                  <div className="flex flex-wrap justify-between items-baseline gap-x-4">
                    <h3 className="font-bold text-foreground uppercase">{edu.institution}</h3>
                    <span className="text-sm text-muted-foreground">{edu.location}</span>
                  </div>
                  <div className="flex flex-wrap justify-between items-baseline gap-x-4">
                    <p className="font-semibold text-foreground">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.period}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{edu.details}</p>
                </div>
              ))}
            </section>
          </div>
        </div>

        {/* Projects Panel - Slides in from right */}
        <div 
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl transform transition-transform duration-300 ease-in-out print:hidden z-40 ${
            showProjects ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Projects Portfolio</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowProjects(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Filter by skill</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto py-1 px-2 text-xs">
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map(skill => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <span>Company:</span>
                <div className="flex gap-1.5">
                  {Object.values(companies).map((company) => (
                    <Badge
                      key={company.id}
                      variant={selectedCompany === company.id ? "default" : "outline"}
                      className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setSelectedCompany(selectedCompany === company.id ? null : company.id)}
                    >
                      {company.name.split(" ")[0]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredProjects.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No projects match the selected filters.</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              ) : (
                filteredProjects.map(project => (
                  <div 
                    key={project.id} 
                    className="p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      {project.url && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>Visit project</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {project.skills.map(skill => (
                          <Badge 
                            key={skill} 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => {
                              if (!selectedSkills.includes(skill)) {
                                toggleSkill(skill)
                              }
                            }}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{project.year}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <Badge 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => {
                          if (selectedCompany !== project.companyId) {
                            setSelectedCompany(project.companyId)
                          }
                        }}
                      >
                        {companies[project.companyId]?.name.split(" ")[0]}
                      </Badge>
                    </div>
                  </div>
                ))
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
  )
}
