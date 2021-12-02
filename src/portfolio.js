const header = {
  // all the properties are optional - can be left empty or deleted
  homepage: "https://kiranojhanp.github.io",
  title: "KO.",
}

const about = {
  // all the properties are optional - can be left empty or deleted
  name: "Kiran Ojha",
  role: "Front End Engineer",
  description:
    "✨ I'm a frontend engineer passionate about making the web accessible to everyone. I'm currently working for Uk based blockchain startup, autaway inc. When I'm not coding, you can find me geeking about photography ✨",
  resume: "https://example.com",
  social: {
    linkedin: "https://www.linkedin.com/in/kiranojhanp/",
    github: "https://github.com/kiranojhanp",
  },
}

const projects = [
  // projects can be added an removed
  // if there are no projects, Projects section won't show up
  {
    name: "DatingApp",
    description:
      "A tinder clone build using NextJS, NestJS and react native. Uses AWS lamda, S3 and Mongodb atlas. Oracle cloud VM used for CI/CD",
    stack: [
      "React native",
      "NextJS",
      "NestJS",
      "Redux toolkit",
      "Storybook",
      "PostCSS",
      "AWS",
      "MongoDB",
      "GraphQL",
      "Gothub actions",
      "Chromatic",
    ],
    sourceCode: "https://github.com",
    livePreview: "https://github.com",
  },
  {
    name: "Project 2",
    description:
      "Amet asperiores et impedit aliquam consectetur? Voluptates sed a nulla ipsa officia et esse aliquam",
    stack: ["SASS", "TypeScript", "React"],
    sourceCode: "https://github.com",
    livePreview: "https://github.com",
  },
  {
    name: "MERN shop",
    description:
      "A fully featured shopping cart using MERN stack and paypal API for payment. This was also my final project for college.",
    stack: [
      "React",
      "NodeJS",
      "Express",
      "MongoDB",
      "Redux",
      "Heroku",
      "Jest",
      "CucumberJS",
    ],
    sourceCode: "https://github.com",
    livePreview: "https://github.com",
  },
]

const skills = [
  // skills can be added or removed
  // if there are no skills, Skills section won't show up
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "React Native",
  "NextJS",
  "Redux",
  "Tailwind",
  "SASS",
  "Storybook",
  "Svelte",
  "Sveltekit",
  "NodeJS",
  "Express",
  "NestJS",
  "SQL",
  "NOSQL",
  "Jest",
  "Enzyme",
  "Git",
  "CI/CD",
  "AWS",
]

const contact = {
  // email is optional - if left empty Contact section won't show up
  email: "kiranojha1226@gmail.com",
}

export { header, about, projects, skills, contact }
