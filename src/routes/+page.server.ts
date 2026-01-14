	import { getQuestionnaire, getSubmissions, addSubmission, setQuestionnaire } from "$lib/server/store";
  import { validateQuestionnaireDraft } from "$lib/helpers.js";

  // +page.server.ts acts as the server-side controller

  // Load () runs on the server on initial page load. provides data
  export function load(){
    return{
      questionnaire: getQuestionnaire(),
      submissions: getSubmissions(),
    };
  }

  export const actions = {
    // Save questionnaire changes from the builder tap
    // Expects hidden field named draft
    save: async({ request }) =>{
      const formdata = await request.formData();
      const raw = formdata.get('draft');

      const json = typeof raw === 'string' ? raw : '';
      if (!json) return {success: false, error: "No draft received"};

      let draft: any;
      try{
        draft = JSON.parse(json);
      } catch{
        return { success: false, error: 'Draft JSON invalid'};
      }

      const result = validateQuestionnaireDraft(draft);
      if (!result.ok) return { success: false, error: result.error };

      setQuestionnaire(result.value);
      return { success: true };

    },

    // Handle submitted answers from the preview tab
    submit: async ({ request }) => {
      const formData = await request.formData()
      const questionnaire = getQuestionnaire();

      const answers: Record<string, string> = {};
      for (const question of questionnaire.questions){
        const raw = formData.get(question.id);

        // turn raw into a string safely
        const value = typeof raw === 'string' ? raw.trim() : '';

        // validate
        if (!value){
          return {success: false, error: `Missing answer for: ${question.label}`};
        }

        // validate mc option
        if(question.kind === 'mc'){
          const options = question.options ?? [];
          if (!options.includes(value)){
            return {success: false, error: `Invalid choice for: ${question.label}`};
          }
        }

        answers[question.id] = value;
      }

      addSubmission(answers);
      return {success: true};
    }
  }
