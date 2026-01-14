import type { Questionnaire, Submission } from "$lib/types";

// In memory datastore
// Restarting the dev server will wipe data

// all submissiosn stored in memory
let submissions: Submission[] = [];

// Current questionaire stored in memory
let questionnaire: Questionnaire = {
  title: "first questionnaire",
  questions: [{
    id: "q1",
    kind: "text",
    label: "first question",
    options: []
  },
  {
    id: "q2",
    kind: "mc",
    label: "second question",
    options: ["first answer", "second answer"]
  }]
};

// returns current questionnaire
export function getQuestionnaire(){
  return questionnaire;
}

// replaces the current questionnaire with the given new one
export function setQuestionnaire(nextQuestionnaire: Questionnaire){
  questionnaire = nextQuestionnaire;
}

// Adds new submission to the submissions list
export function addSubmission(answers: Record<string, string>){
  let submission: Submission = {
    id: `sub_${submissions.length + 1}`,
    createdAt: Date.now(),
    answers: answers,
  };

  submissions.push(submission);
  return submission;
}

// returns submissions
export function getSubmissions(){
  return [...submissions].reverse()
}
