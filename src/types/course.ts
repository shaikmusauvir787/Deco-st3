export type CourseOutcomeId = 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5';
export type BloomLevel = 'BTL1' | 'BTL2' | 'BTL3' | 'BTL4' | 'BTL5';
export type TrackType = 'trackB' | 'trackA' | 'unified';

export type NavSection =
  | 'syllabus'
  | 'lectures'
  | 'repository'
  | 'calculators'
  | 'nba-quiz';

export interface SyllabusUnit {
  id: string;
  unitNumber: string; // e.g. "Unit I"
  title: string;
  track: 'trackA' | 'trackB';
  lectureRange?: string;
  coMapping: CourseOutcomeId[];
  btlRange: string;
  topics: string[];
  keyOutcomes: string[];
  linkedFolder?: string;
  recommendedLab?: 'converter' | 'hamming' | 'arithmetic' | 'cache';
}

export interface LectureEntry {
  id: string; // L1..L60
  lectureNo: number;
  week: number;
  date: string; // e.g. "03-Aug-2026"
  unit: string; // "Unit I".."Unit V"
  co: CourseOutcomeId;
  btl: BloomLevel;
  topic: string;
  trackRef: string;
  resourceFile?: string;
}

export type DriveFileType = 'PPTX' | 'DOCX' | 'PDF' | 'Sheet';
export type DriveFolderName =
  | 'Root'
  | 'CSM'
  | 'CSM_AIML_2026'
  | 'DECO_U1'
  | 'DECO_U2'
  | 'DECO_U3'
  | 'DECO_U4'
  | 'DECO_U5';

export interface DriveFileItem {
  id: string;
  name: string;
  folder: DriveFolderName;
  type: DriveFileType;
  category: 'Lecture Slides' | 'Solved Assessments' | 'Syllabus & Mapping' | 'Question Bank';
  unit?: string;
  co?: CourseOutcomeId;
  summary: string;
  keyTopics: string[];
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  source: string; // e.g., "CIE-1", "CIE-2", "Quiz-1", "Surprise Test 3"
  unit: string;
  co: CourseOutcomeId;
  btl: BloomLevel;
  marks: number;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  solutionSteps: string[];
  finalAnswer: string;
  isAiGenerated?: boolean;
}

export interface CoPoRow {
  co: CourseOutcomeId;
  statement: string;
  btl: string;
  po: (number | null)[]; // PO1..PO12 (1, 2, 3, or null)
  pso: (number | null)[]; // PSO1, PSO2
}

export interface CourseMetadata {
  institution: string;
  accreditation: string;
  regulation: string;
  program: string;
  faculty: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  cieMarks: number;
  seeMarks: number;
  driveUrl: string;
}
