using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaskManager.Application.Interfaces;

namespace TaskManager.Infrastructure.Services;

/// <summary>
/// Autonomous Gemini-powered Task Router Service.
/// Analyzes task requirements, priority, and complexity against candidate workforce skills.
/// </summary>
public class GeminiTaskRouterService : IGeminiTaskRouterService
{
    private readonly string _geminiApiKey;
    private readonly HttpClient _httpClient;
    private readonly ILogger<GeminiTaskRouterService> _logger;
    private const string ModelName = "gemini-3.6-flash";

    public GeminiTaskRouterService(
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<GeminiTaskRouterService> logger)
    {
        _geminiApiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<TaskRouterDecision> RouteTaskAsync(
        string title,
        string? description,
        string? requiredSkills,
        decimal estimatedHours,
        IReadOnlyList<CandidateUserContext> candidates,
        string? feedbackContext = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();

        if (candidates.Count == 0)
        {
            stopwatch.Stop();
            return new TaskRouterDecision(
                RecommendedAssigneeId: null,
                ConfidenceScore: 0.0f,
                ReasoningChain: "No candidate engineers available in the workforce roster for this tenant.",
                ModelVersion: ModelName,
                ExecutionTimeMs: (int)stopwatch.ElapsedMilliseconds
            );
        }

        // Single candidate fast path (if no rejection feedback)
        if (candidates.Count == 1 && string.IsNullOrWhiteSpace(feedbackContext))
        {
            var single = candidates[0];
            stopwatch.Stop();
            return new TaskRouterDecision(
                RecommendedAssigneeId: single.UserId,
                ConfidenceScore: 0.95f,
                ReasoningChain: $"Single eligible workforce member available: {single.FullName} ({single.Role}) with registered skills [{string.Join(", ", single.Skills)}].",
                ModelVersion: ModelName,
                ExecutionTimeMs: (int)stopwatch.ElapsedMilliseconds
            );
        }

        try
        {
            if (string.IsNullOrWhiteSpace(_geminiApiKey))
            {
                _logger.LogWarning("Gemini API key is not configured. Falling back to local skill matching heuristic.");
                return FallbackHeuristicMatch(title, requiredSkills, candidates, feedbackContext, stopwatch);
            }

            var candidateProfiles = candidates.Select(c => new
            {
                userId = c.UserId.ToString(),
                name = c.FullName,
                role = c.Role,
                hourlyRate = c.HourlyRate,
                skills = c.Skills
            });

            var feedbackSection = !string.IsNullOrWhiteSpace(feedbackContext)
                ? $"\n[HUMAN REVIEWER FEEDBACK & REJECTION REASON]\n{feedbackContext}\nInstruction: The previous recommendation was rejected by the Tech Lead. Avoid repeating the previous mistake and recommend an alternative candidate from the workforce.\n"
                : string.Empty;

            var prompt = $@"
You are an Autonomous AI Resource Manager & Task Router for an enterprise engineering team.
Analyze the following task and assign it to the most qualified team member based on required skills and expertise.

[TASK DETAILS]
Title: {title}
Description: {description ?? "No description provided"}
Required Skills: {requiredSkills ?? "General"}
Estimated Hours: {estimatedHours}
{feedbackSection}
[CANDIDATE WORKFORCE ROSTER]
{JsonSerializer.Serialize(candidateProfiles, new JsonSerializerOptions { WriteIndented = true })}

Respond ONLY with a valid, raw JSON object matching this schema (no markdown fences, no code blocks):
{{
  ""recommendedUserId"": ""guid-of-best-user"",
  ""confidenceScore"": 0.92,
  ""reasoningChain"": ""Step 1: Analyzed skill requirements... Step 2: Addressed rejection feedback... Step 3: Selected alternative candidate due to...""
}}
";

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{ModelName}:generateContent?key={_geminiApiKey}";
            var payload = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Gemini API returned status {StatusCode}: {Error}. Falling back to heuristic.", response.StatusCode, error);
                return FallbackHeuristicMatch(title, requiredSkills, candidates, feedbackContext, stopwatch);
            }

            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(responseJson);

            var rawText = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text").GetString() ?? string.Empty;

            // Strip markdown block markers if returned by LLM
            var cleanJson = CleanJsonString(rawText);
            using var resultDoc = JsonDocument.Parse(cleanJson);
            var root = resultDoc.RootElement;

            string? recIdStr = null;
            if (root.TryGetProperty("recommendedUserId", out var idProp) && idProp.ValueKind == JsonValueKind.String)
            {
                recIdStr = idProp.GetString();
            }

            float confidence = 0.85f;
            if (root.TryGetProperty("confidenceScore", out var confProp) && confProp.TryGetSingle(out var confVal))
            {
                confidence = Math.Clamp(confVal, 0.0f, 1.0f);
            }

            string reasoning = "Task auto-assigned based on neural skill matching matrix.";
            if (root.TryGetProperty("reasoningChain", out var reasonProp) && reasonProp.ValueKind == JsonValueKind.String)
            {
                reasoning = reasonProp.GetString() ?? reasoning;
            }

            Guid? recommendedId = Guid.TryParse(recIdStr, out var parsedGuid) ? parsedGuid : candidates[0].UserId;

            stopwatch.Stop();
            return new TaskRouterDecision(
                RecommendedAssigneeId: recommendedId,
                ConfidenceScore: confidence,
                ReasoningChain: reasoning,
                ModelVersion: ModelName,
                ExecutionTimeMs: (int)stopwatch.ElapsedMilliseconds
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while querying Gemini for task routing. Falling back to heuristic.");
            return FallbackHeuristicMatch(title, requiredSkills, candidates, feedbackContext, stopwatch);
        }
    }

    private static string CleanJsonString(string text)
    {
        var cleaned = text.Trim();
        if (cleaned.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
        {
            cleaned = cleaned.Substring(7);
        }
        else if (cleaned.StartsWith("```"))
        {
            cleaned = cleaned.Substring(3);
        }

        if (cleaned.EndsWith("```"))
        {
            cleaned = cleaned.Substring(0, cleaned.Length - 3);
        }

        return cleaned.Trim();
    }

    private static TaskRouterDecision FallbackHeuristicMatch(
        string title,
        string? requiredSkills,
        IReadOnlyList<CandidateUserContext> candidates,
        string? feedbackContext,
        Stopwatch stopwatch)
    {
        stopwatch.Stop();

        var eligibleCandidates = candidates;
        if (!string.IsNullOrWhiteSpace(feedbackContext) && candidates.Count > 1)
        {
            // Filter out previously rejected candidate mentioned in feedback
            var filtered = candidates
                .Where(c => !feedbackContext.Contains(c.FullName, StringComparison.OrdinalIgnoreCase) &&
                            !feedbackContext.Contains(c.Username, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (filtered.Count > 0)
            {
                eligibleCandidates = filtered;
            }
        }

        var skillsToMatch = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (!string.IsNullOrWhiteSpace(requiredSkills))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(requiredSkills);
                if (parsed != null)
                {
                    foreach (var s in parsed) skillsToMatch.Add(s);
                }
            }
            catch
            {
                // Comma separated fallback
                foreach (var s in requiredSkills.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                {
                    skillsToMatch.Add(s);
                }
            }
        }

        // Rank candidates by skill overlap
        var bestCandidate = eligibleCandidates
            .Select(c => new
            {
                Candidate = c,
                Overlap = c.Skills.Count(s => skillsToMatch.Contains(s))
            })
            .OrderByDescending(x => x.Overlap)
            .ThenBy(x => x.Candidate.HourlyRate)
            .First();

        var score = bestCandidate.Overlap > 0 ? 0.90f : 0.75f;
        var feedbackPrefix = !string.IsNullOrWhiteSpace(feedbackContext) ? "[Alternative Recommendation Post-Rejection] " : string.Empty;
        var reasoning = bestCandidate.Overlap > 0
            ? $"{feedbackPrefix}Heuristic Match: {bestCandidate.Candidate.FullName} has {bestCandidate.Overlap} matching skill(s) [{string.Join(", ", bestCandidate.Candidate.Skills.Where(s => skillsToMatch.Contains(s)))}]."
            : $"{feedbackPrefix}Heuristic Baseline: Assigned to {bestCandidate.Candidate.FullName} ({bestCandidate.Candidate.Role}) based on optimal team capacity.";

        return new TaskRouterDecision(
            RecommendedAssigneeId: bestCandidate.Candidate.UserId,
            ConfidenceScore: score,
            ReasoningChain: reasoning,
            ModelVersion: "heuristic-skill-matrix-v1",
            ExecutionTimeMs: (int)stopwatch.ElapsedMilliseconds
        );
    }
}
