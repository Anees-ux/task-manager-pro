using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TaskManager.Application.Interfaces;

namespace TaskManager.Infrastructure.Services;

/// <summary>
/// AI Embedding service — handles Gemini embeddings and Pinecone vector operations.
/// Moved from WebAPI layer to Infrastructure to comply with Clean Architecture.
/// </summary>
public class AiEmbeddingService : IAiEmbeddingService
{
    private readonly string _geminiApiKey;
    private readonly string _pineconeApiKey;
    private readonly string _pineconeHost;
    private readonly HttpClient _httpClient;

    public AiEmbeddingService(IConfiguration configuration, HttpClient httpClient)
    {
        _geminiApiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
        _pineconeApiKey = configuration["Pinecone:ApiKey"] ?? string.Empty;
        _pineconeHost = configuration["Pinecone:Host"] ?? string.Empty;
        _httpClient = httpClient;
    }

    public async Task<float[]> GetEmbeddingAsync(string text, CancellationToken cancellationToken = default)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={_geminiApiKey}";

        var payload = new
        {
            model = "models/gemini-embedding-001",
            content = new { parts = new[] { new { text } } }
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new Exception($"Gemini API error: {response.StatusCode} - {error}");
        }

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var document = JsonDocument.Parse(responseJson);

        return document.RootElement
            .GetProperty("embedding")
            .GetProperty("values")
            .EnumerateArray()
            .Select(x => x.GetSingle())
            .ToArray();
    }

    public async Task UpsertTaskEmbeddingAsync(string taskId, string text, CancellationToken cancellationToken = default)
    {
        var embedding = await GetEmbeddingAsync(text, cancellationToken);
        var url = $"https://{_pineconeHost}/vectors/upsert";

        var payload = new
        {
            vectors = new[]
            {
                new
                {
                    id = taskId,
                    values = embedding,
                    metadata = new { text }
                }
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
        request.Headers.Add("Api-Key", _pineconeApiKey);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new Exception($"Pinecone API error: {response.StatusCode} - {error}");
        }
    }

    public async Task<string> ResolveBlockerAsync(string question, CancellationToken cancellationToken = default)
    {
        // Step 1: Embed the question
        var questionEmbedding = await GetEmbeddingAsync(question, cancellationToken);

        // Step 2: Query Pinecone for similar past tasks
        var pineconeUrl = $"https://{_pineconeHost}/query";
        var pineconePayload = new { vector = questionEmbedding, topK = 3, includeMetadata = true };
        var pineconeContent = new StringContent(JsonSerializer.Serialize(pineconePayload), System.Text.Encoding.UTF8, "application/json");
        var pineconeRequest = new HttpRequestMessage(HttpMethod.Post, pineconeUrl) { Content = pineconeContent };
        pineconeRequest.Headers.Add("Api-Key", _pineconeApiKey);

        var pineconeResponse = await _httpClient.SendAsync(pineconeRequest, cancellationToken);
        if (!pineconeResponse.IsSuccessStatusCode)
        {
            var err = await pineconeResponse.Content.ReadAsStringAsync(cancellationToken);
            throw new Exception($"Pinecone Error: {pineconeResponse.StatusCode} - {err}");
        }

        var pineconeJson = await pineconeResponse.Content.ReadAsStringAsync(cancellationToken);
        using var pineconeDoc = JsonDocument.Parse(pineconeJson);

        var matches = pineconeDoc.RootElement.GetProperty("matches").EnumerateArray();
        var contextBuilder = new System.Text.StringBuilder();
        foreach (var match in matches)
        {
            if (match.TryGetProperty("metadata", out var metadata) && metadata.TryGetProperty("text", out var textVal))
            {
                contextBuilder.AppendLine($"- {textVal.GetString()}");
            }
        }

        // Step 3: Generate answer using Gemini
        var geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={_geminiApiKey}";
        var aiPrompt = $"You are an expert AI assistant helping a developer resolve a blocker. Use the following past resolved tasks as context to answer their question.\n\nContext (Past Tasks):\n{contextBuilder}\n\nQuestion: {question}\n\nAnswer concisely and practically:";

        var geminiPayloadObj = new
        {
            contents = new[] { new { parts = new[] { new { text = aiPrompt } } } }
        };
        var geminiContent = new StringContent(JsonSerializer.Serialize(geminiPayloadObj), System.Text.Encoding.UTF8, "application/json");

        var geminiResponse = await _httpClient.PostAsync(geminiUrl, geminiContent, cancellationToken);
        if (!geminiResponse.IsSuccessStatusCode)
        {
            var err = await geminiResponse.Content.ReadAsStringAsync(cancellationToken);
            throw new Exception($"Gemini Error: {geminiResponse.StatusCode} - {err}");
        }

        var geminiJson = await geminiResponse.Content.ReadAsStringAsync(cancellationToken);
        using var geminiDoc = JsonDocument.Parse(geminiJson);

        return geminiDoc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text").GetString() ?? "No answer generated.";
    }
}
