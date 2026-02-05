export interface Personal {
  name: string;
  location: {
    city: string;
    mapsUrl: string;
  };
  phone: string;
  email: string;
  github: {
    url: string;
    display: string;
  };
}

export interface Company {
  id: string;
  name: string;
  url: string;
  location: string;
  type: string | null;
}

export interface Experience {
  companyId: string;
  title: string;
  period: string;
  responsibilities: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Education {
  institution: string;
  location: string;
  degree: string;
  period: string;
  details: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  companyId: string;
  skills: string[];
  url: string | null;
  year: number;
}

export interface CVData {
  personal: Personal;
  companies: Record<string, Company>;
  experience: Experience[];
  skills: SkillGroup[];
  education: Education[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  companyId: string;
  skills: string[];
  url: string | null;
  year: number;
}
