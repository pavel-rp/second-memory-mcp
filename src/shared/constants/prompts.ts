/** Static reflect prompt included in every `recorded` submit_answer response. */
export const SUBMIT_ANSWER_REFLECT_PROMPT =
  'Based on the conversation so far, consider whether to call add_note on this chunk. ' +
  'Note types: insight (mental models, analogies the learner developed), ' +
  'confusion (misconceptions corrected, concepts that needed re-explanation), ' +
  'connection (links the learner drew to other topics), ' +
  'deeper_exploration (areas where the learner went beyond the stored content). ' +
  'If nothing notable happened, move on.';
