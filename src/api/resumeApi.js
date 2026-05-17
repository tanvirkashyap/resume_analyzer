import axios from "axios";

/**
 * POST /api/resume/analyze
 * Hits Java backend at localhost:8080
 *
 * Request  → multipart/form-data
 *   - file           (required) PDF/DOCX
 *   - jobDescription (optional) string
 *
 * Response → ResumeResponseDTO
 *   - score       : Integer
 *   - skills      : String[]
 *   - suggestions : String[]
 */
export async function analyzeResume(file, jobDescription) {
  const form = new FormData();
  form.append("file", file);
  if (jobDescription) {
    form.append("jobDescription", jobDescription);
  }

  const { data } = await axios.post("/api/resume/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data; // { score, skills, suggestions }
}
