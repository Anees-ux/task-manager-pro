import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '@shared/config/constants';
import { getStoredToken } from '@shared/api/apiClient';

let connection: HubConnection | null = null;

/**
 * Creates or returns an existing SignalR hub connection.
 * Auto-injects the JWT token for authentication.
 */
export function getHubConnection(): HubConnection {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL, {
      accessTokenFactory: () => getStoredToken() ?? '',
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Exponential backoff
    .configureLogging(LogLevel.Warning)
    .build();

  return connection;
}

/**
 * Starts the SignalR connection if not already connected.
 */
export async function startConnection(): Promise<void> {
  const hub = getHubConnection();
  if (hub.state === 'Disconnected') {
    try {
      await hub.start();
      console.log('[SignalR] Connected to TaskBoard hub');
    } catch (err) {
      console.error('[SignalR] Connection failed:', err);
    }
  }
}

/**
 * Stops and disposes the SignalR connection.
 */
export async function stopConnection(): Promise<void> {
  if (connection) {
    await connection.stop();
    connection = null;
    console.log('[SignalR] Disconnected');
  }
}
