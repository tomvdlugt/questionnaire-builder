export type Question = {
  id: string,
  kind: 'text' | 'mc',
  label: string,
  options: string[],
}

export type Questionnaire = {
  title: string,
  questions: Question[]
}

export type Submission = {
  id: string,
  createdAt: number,
  answers: Record<string, string>
}
