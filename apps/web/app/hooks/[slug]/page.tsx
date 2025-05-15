"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import EndpointDetails from "@/components/endpointDetails";
import RequestBuilder from "@/components/requestBuilder";
import RequestSection from "@/components/requestSection";
import Loading from "./loading";

interface Endpoint {
  id: string;
  slug: string;
  url: string;
  name: string;
  description?: string;
  createdAt: string;
  expiresAt: string;
  isPersistent: boolean;
}

interface WebhookRequest {
  id: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  queryParams: Record<string, string>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

interface RequestsResponse {
  requests: WebhookRequest[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export default function WebhookDetailPage() {
  const { slug } = useParams() as { slug: string };
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  // const [socketDebug, setSocketDebug] = useState<string[]>([])
  const [requestBuilderValue, setRequestBuilderValue] = useState<string>(
    '{\n  "event": "test",\n  "data": {\n    "message": "Hello World!"\n  }\n}',
  );

  // Function to add debug messages
  // const addDebugMessage = useCallback((message: string) => {
  //   console.log(`Socket Debug: ${message}`)
  //   setSocketDebug((prev) => [...prev, `${new Date().toISOString()}: ${message}`])
  // }, [])

  // Handle incoming requests
  const handleNewRequest = useCallback(
    (request: WebhookRequest) => {
      // addDebugMessage(`New request received: ${request.id}`)
      setRequests((prev) => {
        // Check if request already exists
        const exists = prev.some((r) => r.id === request.id);
        if (exists) {
          // addDebugMessage(`Request ${request.id} already exists, not adding duplicate`)
          return prev;
        }
        return [request, ...prev];
      });
    },
    [], // addDebugMessage],
  );

  // Fetch endpoint details and initial requests
  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // Fetch endpoint details
        const endpointRes = await fetch(`${apiUrl}/api/endpoints/${slug}`);
        if (!endpointRes.ok) {
          throw new Error("Failed to fetch endpoint details");
        }
        const endpointData = await endpointRes.json();
        setEndpoint(endpointData);

        // Fetch initial requests
        const requestsRes = await fetch(
          `${apiUrl}/api/endpoints/${slug}/requests`,
        );
        if (!requestsRes.ok) {
          throw new Error("Failed to fetch requests");
        }
        const requestsData: RequestsResponse = await requestsRes.json();
        setRequests(requestsData.requests);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoint();
  }, [slug]);

  // Setup Socket.io connection
  useEffect(() => {
    if (!slug) return;

    // Disconnect existing socket if it exists
    if (socketRef.current) {
      // addDebugMessage("Cleaning up existing socket before creating new one")
      socketRef.current.disconnect();
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // addDebugMessage(`Creating socket connection to ${apiUrl}`)

    // Create socket connection with auto-reconnect
    const socket = io(apiUrl, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      // const socketId = socket.id;
      // addDebugMessage(`Socket connected with ID: ${socketId}`)
      setSocketConnected(true);

      // Explicitly join the room for this endpoint
      // (`Joining room for slug: ${slug}`)
      socket.emit("join", slug);
    });

    // socket.on("connect_error", (err) => {
    //   (`Socket connection error: ${err.message}`)
    // });

    // socket.on("disconnect", (reason) => {
    //   (`Socket disconnected: ${reason}`)
    //   setSocketConnected(false);
    // });

    // socket.on("reconnect", (attemptNumber) => {
    //   (`Socket reconnected after ${attemptNumber} attempts`)
    //   socket.emit("join", slug);
    // });

    // socket.on("reconnect_attempt", (attemptNumber) => {
    //   (`Socket reconnection attempt ${attemptNumber}`)
    // });

    // socket.on("error", (err) => {
    //   (`Socket error: ${err}`)
    // });

    // // Debug events to confirm room joining
    // socket.on("room_joined", (room) => {
    //   // addDebugMessage(`Successfully joined room: ${room}`)
    // });

    // Request events
    socket.on("new-request", handleNewRequest);

    // Clean up function
    return () => {
      // addDebugMessage("Cleaning up socket connection")
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("reconnect");
      socket.off("reconnect_attempt");
      socket.off("error");
      socket.off("room_joined");
      socket.off("new-request");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [slug, handleNewRequest]);

  // Delete a request
  const deleteRequest = async (requestId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/endpoints/requests/${requestId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete request");
      }

      // Remove from state
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error deleting request:", err);
      }
      else {
        console.error("Something went wrong. Please try again.");
      }
    }
  };

  // Delete the endpoint
  const deleteEndpoint = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this endpoint? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res: Response = await fetch(`${apiUrl}/api/endpoints/${slug}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete endpoint");
      }

      // Redirect to home page
      window.location.href = "/";
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error deleting endpoint:", err);
      }
      else {
        console.error("Something went wrong. Please try again.");
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Endpoint not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EndpointDetails
        endpoint={endpoint}
        socketConnected={socketConnected}
        requestBuilderValue={requestBuilderValue}
        onReconnect={() => {
          if (socketRef.current) {
            socketRef.current.disconnect();
            setTimeout(() => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL;
              const newSocket = io(apiUrl);
              socketRef.current = newSocket;
              newSocket.on("connect", () => {
                setSocketConnected(true);
                newSocket.emit("join", slug);
              });
              newSocket.on("disconnect", () => setSocketConnected(false));
              newSocket.on("new-request", handleNewRequest);
            }, 500);
          }
        }}
        onDelete={deleteEndpoint}
      />

      <RequestBuilder
        endpoint={endpoint}
        onNewRequest={handleNewRequest}
        requestBuilderValue={requestBuilderValue}
        setRequestBuilderValue={setRequestBuilderValue}
      />

      <RequestSection requests={requests} onDeleteRequest={deleteRequest} />
    </div>
  );
}
