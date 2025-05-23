// The full list of lessons mapped to their IDs
export const lessonVideos: Record<string, { title: string; url: string }> = {
  // Python Programming Basics
  "1": { title: "Python Intro", url: "https://www.youtube.com/embed/_uQrJ0TkZlc" },
  "2": { title: "Variables & Data Types", url: "https://www.youtube.com/embed/kqtD5dpn9C8" },
  "3": { title: "Control Flow", url: "https://www.youtube.com/embed/6iF8Xb7Z3wQ" },

  // Web Development Fundamentals
  "4": { title: "HTML Basics", url: "https://www.youtube.com/embed/qz0aGYrrlhU" },
  "5": { title: "CSS Fundamentals", url: "https://www.youtube.com/embed/1PnVor36_40" },
  "6": { title: "JavaScript Intro", url: "https://www.youtube.com/embed/hdI2bqOjy3c" },

  // Data Science Essentials
  "7": { title: "What is Data Science?", url: "https://www.youtube.com/embed/X3paOmcrTjQ" },
  "8": { title: "Python for Data", url: "https://www.youtube.com/embed/r-uOLxNrNk8" },
  "9": { title: "Pandas Tutorial", url: "https://www.youtube.com/embed/vmEHCJofslg" },

  // Responsive Web Design
  "10": { title: "Responsive Design Basics", url: "https://www.youtube.com/embed/srvUrASNj0s" },
  "11": { title: "Media Queries", url: "https://www.youtube.com/embed/5xzaGSYd7jM" },
  "12": { title: "Flexbox Guide", url: "https://www.youtube.com/embed/fYq5PXgSsbE" },

  // Game Development
  "13": { title: "Unity Game Dev", url: "https://www.youtube.com/embed/IlKaB1etrik" },
  "14": { title: "C# for Unity", url: "https://www.youtube.com/embed/HXFoUGw7eKk" },
  "15": { title: "Godot 2D Tutorial", url: "https://www.youtube.com/embed/Z3xSXjWJz_s" },

  // Cybersecurity Fundamentals
  "16": { title: "Intro to Cybersecurity", url: "https://www.youtube.com/embed/2N3jjGO4vvw" },
  "17": { title: "Types of Attacks", url: "https://www.youtube.com/embed/3V2gGkIEqys" },
  "18": { title: "Password Security", url: "https://www.youtube.com/embed/3NjQ9b3pgIg" },

  // Intro to AI
  "19": { title: "AI Basics", url: "https://www.youtube.com/embed/2ePf9rue1Ao" },
  "20": { title: "Machine Learning Intro", url: "https://www.youtube.com/embed/GwIo3gDZCVQ" },
  "21": { title: "Neural Networks", url: "https://www.youtube.com/embed/aircAruvnKk" },

  // Public Speaking
  "22": { title: "Speaking Confidently", url: "https://www.youtube.com/embed/tShavGuo0_E" },
  "23": { title: "Body Language Tips", url: "https://www.youtube.com/embed/CzH7zHBh4gU" },
  "24": { title: "Handling Stage Fear", url: "https://www.youtube.com/embed/xTU9J3j0NYU" },

  // JavaScript Basics
  "25": { title: "JS Intro", url: "https://www.youtube.com/embed/W6NZfCO5SIk" },
  "26": { title: "Functions in JS", url: "https://www.youtube.com/embed/8dWL3wF_OMw" },
  "27": { title: "DOM Manipulation", url: "https://www.youtube.com/embed/0ik6X4DJKCc" },

  // Introduction to Blockchain
  "28": { title: "Blockchain Basics", url: "https://www.youtube.com/embed/SSo_EIwHSd4" },
  "29": { title: "How Bitcoin Works", url: "https://www.youtube.com/embed/bBC-nXj3Ng4" },
  "30": { title: "Smart Contracts", url: "https://www.youtube.com/embed/ZE2HxTmxfrI" },

  // SEO Fundamentals
  "31": { title: "SEO Introduction", url: "https://www.youtube.com/embed/hF515-0Tduk" },
  "32": { title: "On-Page SEO", url: "https://www.youtube.com/embed/MnoV4JJU-zM" },
  "33": { title: "Technical SEO", url: "https://www.youtube.com/embed/0oSPQMDRX3I" },

  // Personal Finance
  "34": { title: "Budgeting Basics", url: "https://www.youtube.com/embed/LFckLkfpIew" },
  "35": { title: "Saving & Investing", url: "https://www.youtube.com/embed/2DqH6xdzwLE" },
  "36": { title: "Credit & Debt", url: "https://www.youtube.com/embed/GsR2eJZ6xYg" },

  // SQL Basics
  "37": { title: "SQL Intro", url: "https://www.youtube.com/embed/27axs9dO7AE" },
  "38": { title: "Basic Queries", url: "https://www.youtube.com/embed/HXV3zeQKqGY" },
  "39": { title: "Joins in SQL", url: "https://www.youtube.com/embed/9yeOJ0ZMUYw" },

  // UX Design Principles
  "40": { title: "UX vs UI", url: "https://www.youtube.com/embed/9Bxt19EtZc4" },
  "41": { title: "Design Thinking", url: "https://www.youtube.com/embed/_r0VX-aU_T8" },
  "42": { title: "User Research", url: "https://www.youtube.com/embed/GdWb-Qn3ErA" },

  // Social Media Marketing
  "43": { title: "Social Media Strategy", url: "https://www.youtube.com/embed/YpYQ1tFZjUo" },
  "44": { title: "Content Planning", url: "https://www.youtube.com/embed/nW_jxNAyR14" },
  "45": { title: "Social Ads", url: "https://www.youtube.com/embed/0Gze_PZ9jhU" },

  // IoT Basics
  "46": { title: "What is IoT?", url: "https://www.youtube.com/embed/LlhmzVL5bm8" },
  "47": { title: "IoT with Raspberry Pi", url: "https://www.youtube.com/embed/_0dWnUNjxas" },
  "48": { title: "Sensors & Connectivity", url: "https://www.youtube.com/embed/CvL1sQp2kas" },

  // Digital Photography
  "49": { title: "Photography Basics", url: "https://www.youtube.com/embed/X9YjlnFfb_4" },
  "50": { title: "Camera Settings", url: "https://www.youtube.com/embed/F8T94sdiNjc" },
  "51": { title: "Lighting Tips", url: "https://www.youtube.com/embed/U3I-cmWc7V4" },

  // UX Design Fundamentals
  "52": { title: "Wireframing", url: "https://www.youtube.com/embed/UqQZXAvth8k" },
  "53": { title: "Prototyping", url: "https://www.youtube.com/embed/D8T_ZoC2f_A" },
  "54": { title: "Usability Testing", url: "https://www.youtube.com/embed/F5Y3nhdVaGU" },

  // Video Editing
  "55": { title: "Video Editing Basics", url: "https://www.youtube.com/embed/dkKtb5kA5_Y" },
  "56": { title: "Editing with CapCut", url: "https://www.youtube.com/embed/EzNYLjhFWTs" },
  "57": { title: "Transitions and Effects", url: "https://www.youtube.com/embed/KqSTZ2eegR4" },

  // Digital Marketing Fundamentals
  "58": { title: "Digital Marketing Intro", url: "https://www.youtube.com/embed/7_1j5gYHg-o" },
  "59": { title: "Email & Content", url: "https://www.youtube.com/embed/UkdGxdKqksU" },
  "60": { title: "Google Ads", url: "https://www.youtube.com/embed/jm5DWa2bpbs" },

  // 3D Modeling Basics
  "61": { title: "Intro to Blender", url: "https://www.youtube.com/embed/TPrnSACiTJ4" },
  "62": { title: "Modeling a House", url: "https://www.youtube.com/embed/dH-T3B3tkvM" },
  "63": { title: "Texturing & Lighting", url: "https://www.youtube.com/embed/FMn9PDv4VIA" },

  // Email Marketing
  "64": { title: "Email Campaign Basics", url: "https://www.youtube.com/embed/Tkb_AYn-XTs" },
  "65": { title: "Mailchimp Tutorial", url: "https://www.youtube.com/embed/AgpP4ZKjM4w" },
  "66": { title: "A/B Testing", url: "https://www.youtube.com/embed/Bzj3JzTYzXk" },

  // Content Creation
  "67": { title: "Content Strategy", url: "https://www.youtube.com/embed/U5LIzEtYkK8" },
  "68": { title: "Writing for the Web", url: "https://www.youtube.com/embed/q9KY1znEF4E" },
  "69": { title: "Repurposing Content", url: "https://www.youtube.com/embed/Sqg6J2xF2Xs" },

  // Cloud Computing
  "70": { title: "Cloud Computing Intro", url: "https://www.youtube.com/embed/2LaAJq1lB1Q" },
  "71": { title: "AWS Basics", url: "https://www.youtube.com/embed/ulprqHHWlng" },
  "72": { title: "Deploying to Cloud", url: "https://www.youtube.com/embed/JIbIYCM48to" },
};

// Map course IDs to lesson IDs
export const courseToLessons: Record<number, number[]> = {
  1: [1, 2, 3], // Python Programming Basics
  2: [4, 5, 6], // Web Development Fundamentals
  3: [7, 8, 9], // Data Science Essentials
  4: [10, 11, 12], // Responsive Web Design
  5: [13, 14, 15], // Game Development
  6: [16, 17, 18], // Cybersecurity Fundamentals
  7: [19, 20, 21], // Intro to AI
  8: [22, 23, 24], // Public Speaking
  9: [25, 26, 27], // JavaScript Basics
  10: [28, 29, 30], // Introduction to Blockchain
  11: [31, 32, 33], // SEO Fundamentals
  12: [34, 35, 36], // Personal Finance
  13: [37, 38, 39], // SQL Basics
  14: [40, 41, 42], // UX Design Principles
  15: [43, 44, 45], // Social Media Marketing
  16: [46, 47, 48], // IoT Basics
  17: [49, 50, 51], // Digital Photography
  18: [52, 53, 54], // UX Design Fundamentals
  19: [55, 56, 57], // Video Editing
  20: [58, 59, 60], // Digital Marketing Fundamentals
  21: [61, 62, 63], // 3D Modeling Basics
  22: [64, 65, 66], // Email Marketing
  23: [67, 68, 69], // Content Creation
  24: [70, 71, 72], // Cloud Computing
};

// Categories with color mapping
export const categories = [
  { name: "Programming", color: "bg-primary-500" },
  { name: "Web Development", color: "bg-secondary-500" },
  { name: "Data Science", color: "bg-accent-500" },
  { name: "Design", color: "bg-pink-500" },
  { name: "Business", color: "bg-purple-500" },
  { name: "Marketing", color: "bg-green-500" },
  { name: "Personal Development", color: "bg-blue-500" },
  { name: "Technology", color: "bg-red-500" },
];

// Helper function to calculate course progress
export const calculateCourseProgress = (
  progress: { lessonId: number; completed: boolean }[],
  courseId: number
): number => {
  const lessonIds = courseToLessons[courseId] || [];
  if (lessonIds.length === 0) return 0;
  
  const completedLessons = lessonIds.filter(lessonId => 
    progress.some(p => p.lessonId === lessonId && p.completed)
  ).length;
  
  return Math.round((completedLessons / lessonIds.length) * 100);
};

// Helper to get next and previous lessons
export const getAdjacentLessons = (
  courseId: number,
  currentLessonId: number
): { prev: number | null; next: number | null } => {
  const courseLessons = courseToLessons[courseId] || [];
  const currentIndex = courseLessons.indexOf(currentLessonId);
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  
  return {
    prev: currentIndex > 0 ? courseLessons[currentIndex - 1] : null,
    next: currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null,
  };
};
