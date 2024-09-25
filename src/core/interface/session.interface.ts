export interface SessionInterface {
  question: string;
  questionType: string;
  fileIds?: string[];
  folderIds?: string[];
  sessionIds?: string[];
  answers?: string[];
  questiningUrl?: string[];
  answer: string;
  isParent: boolean;
  parent: string;
  userId: number;
  ignore?: boolean;
  originalContent?: string;
}
