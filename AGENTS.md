# AI Agents

# Evaluation Criteria

Always ensure all features and code satisfy the following project evaluation criteria:

## AI Prompt Engineering
- **Ability to extract fields accurately**: Prompts and AI pipeline must ensure precise field extraction.
- **Intelligent field mapping**: Map dynamic/messy input columns to standard target fields intelligently.
- **Handling messy datasets**: Clean and handle unexpected formatting, missing values, and structure anomalies.
- **Handling ambiguous columns**: Resolve ambiguity in column headers using LLM reasoning and smart fallback logic.

## Backend Quality
- **API design**: RESTful, clean, predictable API endpoints with appropriate status codes.
- **Clean architecture**: Logical separation of concerns (e.g., controllers, services, repositories/utils).
- **Error handling**: Comprehensive error catching, structured response payloads, and informative logging.
- **Batch processing**: Handle large datasets efficiently without timing out or running out of memory.
- **Maintainable code**: Readable code, modular functions, clear naming conventions, and docstrings.

## Frontend Quality
- **Modern UI**: Clean, stunning interface with professional aesthetic (colors, typography, spacing).
- **Responsive layout**: Works seamlessly on desktop, tablet, and mobile.
- **Clean UX**: Intuitive flows, clear instructions, and minimal friction.
- **CSV preview experience**: Interactive table preview for CSV data before processing.
- **Loading states**: Skeletons, spinners, or progress bars for all asynchronous operations.
- **Error handling**: Clear error messages in UI with graceful recovery.

## Code Quality
- **Readability**: Code must be readable and clean.
- **Type safety**: Strict TypeScript types where possible; avoid `any`.
- **Folder structure**: Structured and consistent directory hierarchy.
- **Reusability**: Extract reusable components, custom hooks, and utility functions.
- **Best practices**: Adhere to modern Next.js/React standard patterns.

## Overall Engineering
- **Performance**: Optimize rendering, API response times, and state updates.
- **Edge case handling**: Test and handle empty values, extremely large files, invalid files, and API failures.
- **Production readiness**: Secure, robust, and deployable codebase.
