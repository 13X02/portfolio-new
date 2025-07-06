"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Poppins } from 'next/font/google'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, Mail, ExternalLink, ArrowDown } from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle" // Assumes you have this component
import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700']
})

export default function Portfolio() {
  const [showCrawl, setShowCrawl] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: -200, y: -200 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCrawl(false)
    }, 30000)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  if (showCrawl) {
    return <StarWarsCrawl onSkip={() => setShowCrawl(false)} />
  }

  return (
    // Define CSS variables for star colors. Tailwind's dark: prefix will toggle them automatically.
    <div
      className={`${poppins.className} 
        min-h-screen 
        bg-white text-black dark:bg-black dark:text-white 
        [--star-rgb:0,0,0] dark:[--star-rgb:255,255,255]
        transition-colors duration-500 relative isolate cursor-none`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="pointer-events-none fixed z-50 rounded-full bg-white transition-opacity duration-300"
        style={{ opacity: isHovering ? 1 : 0, mixBlendMode: 'difference', left: `${mousePosition.x}px`, top: `${mousePosition.y}px`, width: '25px', height: '25px', transform: 'translate(-50%, -50%)' }}
      />

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* === HERO SECTION (CORRECTED) === */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        // FIX 1: The hero section gets its theme-aware background back.
        className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden bg-white dark:bg-black transition-colors duration-500"
      >
        {/* FIX 2: This container is now TRANSPARENT and just positions the stars. */}
        <div className="absolute inset-0 z-0">
          <StarsBackground />
          <ShootingStars />
        </div>

        {/* FIX 3: The text content needs a z-index to ensure it's on top of the stars. */}
        <div className="max-w-4xl text-center z-10">
           <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-6xl md:text-8xl font-normal mb-6 tracking-tight text-black dark:text-white">
            Abhijith H
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="text-xl md:text-2xl font-light text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Generative AI Developer building intelligent, data-driven solutions from concept to production.
          </motion.p>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Specializing in Retrieval-Augmented Generation (RAG), LLM agents, and full-stack application development. I design and implement AI systems that are scalable, efficient, and solve real-world problems.
          </motion.p>
        </div>
        <div className="absolute bottom-8 animate-bounce z-10">
          <ArrowDown className="w-6 h-6 text-gray-400 dark:text-gray-500" />
        </div>
      </motion.section>

      {/* The rest of your portfolio sections */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={containerVariants} className="py-20 px-6 bg-gray-50 dark:bg-zinc-900">
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-normal mb-16 text-center">About</h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                I'm a passionate and entrepreneurial engineer, currently co-founding an AI product studio, nevolabs, while also contributing to enterprise-grade AI solutions at UST. My focus is on the complete development lifecycle of AI-powered applications.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                With a strong foundation in computer science and hands-on experience in both startup and corporate environments, I excel at building sophisticated RAG pipelines, fine-tuning LLM agents, and architecting scalable backend systems.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                I thrive on turning complex problems into elegant, functional products and am always exploring new frontiers in generative AI and software engineering.
              </p>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-4">Core Expertise</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Badge variant="outline" className="justify-center py-2 dark:border-gray-600"> Generative AI </Badge>
                  <Badge variant="outline" className="justify-center py-2 dark:border-gray-600"> RAG Pipelines </Badge>
                  <Badge variant="outline" className="justify-center py-2 dark:border-gray-600"> LLM Agents </Badge>
                  <Badge variant="outline" className="justify-center py-2 dark:border-gray-600"> Full-Stack Dev </Badge>
                  <Badge variant="outline" className="justify-center py-2 dark:border-gray-600"> REST APIs </Badge>
                  <Badge variant="outline" className="justify-center py-2 dark:border-gray-600"> Agile Methodologies </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-4">Technologies</h3>
                <div className="text-gray-600 dark:text-gray-400 space-y-2">
                  <div>Python • Java • JavaScript • SQL</div>
                  <div>LangChain • dspy • Spring Boot • React</div>
                  <div>AWS • Git • FAISS • Tailwind CSS</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={containerVariants} className="py-20 px-6">
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-normal mb-16 text-center">Experience</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" className="space-y-12">
              <ExperienceItem year="Sep 2024 - Present" title="Cofounder & Lead Developer" company="nevolabs (Product Studio)" description="Co-founded a product studio to create AI-powered B2B solutions. Leading the end-to-end development of our flagship product, Onvoke, an AI generator for SOPs and technical documentation." skills={["AI Strategy", "Product Dev", "RAG", "LangChain", "Python"]} />
              <ExperienceItem year="July 2024 - Present" title="Developer I - Software Engineering" company="UST" description="Develop and optimize RAG pipelines using LangChain and FAISS, improving information retrieval latency. Building and fine-tuning LLM agents with OpenAI/Gemini for intelligent automation and pioneering a context-aware coding assistant." skills={["Generative AI", "RAG", "LangChain", "FAISS", "AWS Lambda"]} />
              <ExperienceItem year="Jan 2024 - Jun 2024" title="Software Developer Trainee" company="UST" description="Completed an intensive training program focused on full-stack development. Contributed to internal projects, assisting senior developers in building and testing REST APIs with Spring Boot and developing UI components with React." skills={["Java", "Spring Boot", "React", "REST APIs", "Agile"]} />
              <ExperienceItem year="May 2023 - Aug 2023" title="Frontend Developer Intern" company="IHRD" description="Developed and maintained responsive user interfaces for client websites using React and Tailwind CSS. Collaborated with designers to translate Figma mockups into interactive web components and ensured cross-browser compatibility." skills={["React", "JavaScript", "Tailwind CSS", "HTML/CSS", "Figma"]} />
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={containerVariants} className="py-20 px-6 bg-gray-50 dark:bg-zinc-900">
        <motion.div variants={itemVariants} className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-normal mb-16 text-center">Selected Projects</h2>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProjectCard title="Onvoke - AI SOP Generator" description="Engineered an AI platform to automatically generate Standard Operating Procedures (SOPs) from user inputs, using a sophisticated RAG pipeline to ensure accuracy." tech={["Python", "LangChain", "RAG", "FAISS", "LLM APIs"]} status="Production" />
            <ProjectCard title="AI-Powered Interview Prep" description="A tool that scrapes a company's website to craft personalized answers to the 'Why work here?' interview question. Deployed on AWS Lambda for scalable, on-demand generation." tech={["Python", "LangChain", "Vector DBs", "AWS Lambda"]} status="Live" />
            <ProjectCard title="Context-Aware Coding Assistant" description="Architected an end-to-end coding assistant agent using LangGraph. The system understands project context to provide relevant code suggestions, bug fixes, and documentation." tech={["LangGraph", "LangChain", "LLM Agents", "Python", "CI/CD"]} status="Beta" />
            <ProjectCard title="Full-Stack E-commerce API" description="Designed and developed a complete backend system for an e-commerce platform using Spring Boot. Features include user authentication, product management, and order processing." tech={["Java", "Spring Boot", "REST API", "SQL", "Postman"]} status="Beta" />
            <ProjectCard title="RAG Evaluation Framework" description="A modular framework in Python to benchmark and evaluate the performance of different RAG pipeline configurations, measuring metrics like faithfulness and answer relevancy." tech={["Python", "dspy", "RAG", "Evaluation", "Pandas"]} status="Research" />
            <ProjectCard title="Interactive Developer Portfolio" description="A dynamic, responsive portfolio website built with Next.js and Tailwind CSS, featuring smooth animations with Framer Motion and a theme toggle for user preference." tech={["Next.js", "React", "Tailwind CSS", "Framer Motion"]} status="Live" />
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={containerVariants} className="py-20 px-6">
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-normal mb-8">Let's Build Something Amazing</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed"> I'm actively seeking opportunities and collaborations where I can apply my skills in generative AI and software engineering. Let's connect and discuss how we can create value together. </p>
          <div className="flex justify-center space-x-8 mb-12">
            <a href="mailto:abhijithh496@gmail.com" className="flex items-center space-x-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"> <Mail className="w-5 h-5" /> <span>Email</span> </a>
            <a href="https://github.com/13x02" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"> <Github className="w-5 h-5" /> <span>GitHub</span> </a>
            <a href="https://linkedin.com/in/13x02" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"> <Linkedin className="w-5 h-5" /> <span>LinkedIn</span> </a>
          </div>
          <Button asChild className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-8 py-3">
            <a href="mailto:abhijithh496@gmail.com">Get In Touch</a>
          </Button>
        </motion.div>
      </motion.section>
      
   
    </div>
  )
}

// Sub-components (StarWarsCrawl, ExperienceItem, ProjectCard) remain the same
// ... (include the unchanged sub-components here)

function StarWarsCrawl({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="fixed inset-0 bg-black overflow-hidden cursor-pointer" onClick={onSkip}>
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="crawl-container">
        <div className="crawl">
          <div className="title">
            <h1>EPISODE I</h1>
            <h2>THE PROMPT OF HOPE</h2>
          </div>
          <div className="text">
            <p> It is a time of digital unrest. The galaxy is dominated by the monolithic LEGACY CODE EMPIRE, its rigid systems stifling innovation. </p>
            <p> From a hidden base, a secret alliance of Open Source contributors has challenged the Empire by intercepting a transmission: the core activation prompt for the MONOLITH, a closed-source AGI designed to centralize all knowledge. </p>
            <p> Now, pursued by the Empire's dreaded Linting Droids, a lone developer, ABHIJITH H, carries this stolen prompt. A master of the Transformer Arts and an Architect of Neural Nets, he is the galaxy's last hope to democratize intelligence. </p>
            <p> He must now decode the prompt's secrets and use its power to build a new generation of open, intelligent systems, restoring balance to the digital frontier.... </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-center text-sm animate-pulse z-20">
        Click anywhere to skip
      </div>
      <style jsx>{`
        .crawl-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; perspective: 800px; }
        .crawl { position: relative; top: 100%; transform-origin: 50% 100%; animation: crawl 35s linear forwards; color: #ffffff; font-family: monospace; font-weight: bold; text-align: justify; text-align-last: center; transform: rotateX(25deg); }
        .title { margin-bottom: 80px; text-align: center; }
        .title h1 { font-size: 4.5rem; margin-bottom: 30px; letter-spacing: 6px; }
        .title h2 { font-size: 5rem; letter-spacing: 4px; margin-bottom: 50px; }
        .text { max-width: 1400px; margin: 0 auto; font-size: 2.8rem; line-height: 1.6; letter-spacing: 2px; }
        .text p { margin-bottom: 40px; }
        @keyframes crawl { 0% { top: 100%; transform: rotateX(25deg) translateZ(0); } 100% { top: -180%; transform: rotateX(25deg) translateZ(-3500px); } }
        .stars { width: 1px; height: 1px; background: transparent; box-shadow: 1780px 1216px #fff, 1819px 1595px #fff, 1699px 1799px #fff, 1207px 1699px #fff, 1699px 1207px #fff, 1819px 1216px #fff, 1780px 1595px #fff, 1207px 1799px #fff; animation: animStar 50s linear infinite; }
        .stars2 { width: 2px; height: 2px; background: transparent; box-shadow: 700px 400px #fff, 900px 600px #fff, 1100px 800px #fff, 1300px 200px #fff, 1500px 1000px #fff, 200px 300px #fff, 400px 500px #fff, 600px 700px #fff; animation: animStar 100s linear infinite; }
        .stars3 { width: 3px; height: 3px; background: transparent; box-shadow: 800px 500px #fff, 1000px 300px #fff, 1200px 700px #fff, 1400px 900px #fff, 300px 400px #fff, 500px 600px #fff, 700px 200px #fff, 900px 800px #fff; animation: animStar 150s linear infinite; }
        @keyframes animStar { from { transform: translateY(0px); } to { transform: translateY(-2000px); } }
      `}</style>
    </div>
  )
}

function ExperienceItem({ year, title, company, description, skills }: { year: string; title: string; company: string; description: string; skills: string[] }) {
    const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }
  return (
    <motion.div variants={itemVariants} className="relative pl-16 md:pl-20">
      <div className="absolute left-6 top-2 w-4 h-4 bg-black dark:bg-white rounded-full border-4 border-white dark:border-black shadow-lg hidden md:block"></div>
      <div className="mb-2"><span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{year}</span></div>
      <h3 className="text-2xl font-medium mb-1">{title}</h3>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{company}</p>
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (<Badge key={index} variant="secondary" className="text-xs dark:bg-zinc-700 dark:text-zinc-200">{skill}</Badge>))}
      </div>
    </motion.div>
  )
}

function ProjectCard({ title, description, tech, status }: { title: string; description: string; tech: string[]; status: string }) {
  const statusColors = { Live: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200", Production: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200", Research: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200", Beta: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200" };
    const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full hover:shadow-xl dark:hover:shadow-white/10 transition-all duration-300 bg-white dark:bg-zinc-800/50 dark:border-zinc-700 hover:-translate-y-2">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-xl font-medium">{title}</CardTitle>
            <Badge className={`${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"} border border-transparent`}>{status}</Badge>
          </div> 
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {tech.map((item, index) => (<Badge key={index} variant="outline" className="text-xs dark:border-gray-600">{item}</Badge>))}
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-auto text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Project
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}