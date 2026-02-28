import type { SearchPort } from '../ports/search-port.js';
import type { SearchLearningContentInput, SearchResultSet } from '../domain/types/search-tools.js';

export async function searchLearningContent(
  input: SearchLearningContentInput,
  deps: { search: SearchPort }
): Promise<SearchResultSet> {
  return deps.search.searchByQuery(input);
}
