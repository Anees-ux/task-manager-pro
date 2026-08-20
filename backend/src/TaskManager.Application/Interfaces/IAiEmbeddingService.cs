namespace TaskManager.Application.Interfaces;

/// <summary>
/// Contract for AI embedding and RAG operations.
/// Implementation lives in Infrastructure layer (Gemini + Pinecone).
/// </summary>
public interface IAiEmbeddingService
{
    /// <summary>Generates a vector embedding for the given text using the configured LLM.</summary>
    Task<float[]> GetEmbeddingAsync(string text, CancellationToken cancellationToken = default);

    /// <summary>Upserts a task embedding into the vector store.</summary>
    Task UpsertTaskEmbeddingAsync(string taskId, string text, CancellationToken cancellationToken = default);

    /// <summary>Resolves a blocker question using RAG (vector search + LLM generation).</summary>
    Task<string> ResolveBlockerAsync(string question, CancellationToken cancellationToken = default);
}
