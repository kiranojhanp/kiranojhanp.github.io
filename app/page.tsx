import { InteractiveCV } from "@/components/interactive-cv"
import cvData from "@/data/cv-data.json"
import projects from "@/data/projects.json"
import type { CVData, Project } from "@/lib/types"

// Force static rendering at build time
export const dynamic = "force-static"

export default function CVPage() {
  return (
    <InteractiveCV 
      cvData={cvData as CVData} 
      projects={projects as Project[]} 
    />
  )
}
