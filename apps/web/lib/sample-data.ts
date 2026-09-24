export type Level = "JHS" | "SHS" | "University";

export type Project = {
  slug: string;
  title: string;
  category: string;
  level: Level;
  duration: string;
  type: "Digital" | "Physical" | "Hybrid";
  description: string;
  image: string;
  accent: string;
};

export const projects: Project[] = [
  { slug: "attendance-app", title: "Build a school attendance app", category: "Software", level: "SHS", duration: "4–6 weeks", type: "Digital", description: "Create a web app to track attendance and generate useful reports.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&q=85", accent: "blue" },
  { slug: "solar-charger", title: "Design a solar charging station", category: "Renewable Energy", level: "SHS", duration: "4–8 weeks", type: "Physical", description: "Build a solar-powered charging station for your school or community.", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1000&q=85", accent: "gold" },
  { slug: "flood-warning", title: "Create a flood warning system", category: "Civil + Electronics", level: "SHS", duration: "4–6 weeks", type: "Hybrid", description: "Use sensors to monitor water levels and send early alerts.", image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1000&q=85", accent: "teal" },
  { slug: "line-robot", title: "Make a line-following robot", category: "Robotics", level: "JHS", duration: "2–4 weeks", type: "Physical", description: "Build and program a robot to follow a line using sensors.", image: "https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?w=1000&q=85", accent: "orange" },
  { slug: "crop-ai", title: "Train a crop disease detector", category: "Data & AI", level: "University", duration: "4–8 weeks", type: "Digital", description: "Use computer vision to identify plant diseases from leaf images.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&q=85", accent: "teal" },
  { slug: "footbridge", title: "Model a safe footbridge", category: "Civil", level: "University", duration: "6–8 weeks", type: "Digital", description: "Design and analyze a bridge using CAD and simulation.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000&q=85", accent: "gold" },
  { slug: "health-monitor", title: "Build a health monitoring device", category: "Biomedical", level: "SHS", duration: "4–6 weeks", type: "Physical", description: "Prototype a device that measures heart rate and temperature.", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1000&q=85", accent: "orange" },
  { slug: "secure-chat", title: "Create a secure chat app", category: "Computer Science", level: "University", duration: "6–8 weeks", type: "Digital", description: "Build an end-to-end encrypted chat app and learn security basics.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&q=85", accent: "blue" }
];

export const categories = ["All projects", "Computer Science", "Software", "Electrical", "Mechanical", "Civil", "Robotics", "Renewable Energy", "Biomedical", "Data & AI"];
