"use client";

import { useState, useRef, useEffect } from "react";
import * as monaco from "@monaco-editor/react";

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
  body: any;
  queryParams: Record<string, string>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

interface RequestBuilderProps {
  endpoint: Endpoint;
  onNewRequest: (request: WebhookRequest) => void;
  requestBuilderValue: string;
  setRequestBuilderValue: (value: string) => void;
}

type RequestTab = "body" | "headers" | "query";

interface HeaderParam {
  key: string;
  value: string;
  id: string;
}

interface QueryParam {
  key: string;
  value: string;
  id: string;
}

export default function RequestBuilder({
  endpoint,
  onNewRequest,
  requestBuilderValue,
  setRequestBuilderValue,
}: RequestBuilderProps) {
  const requestBuilderEditorRef = useRef<any>(null);
  const [requestMethod, setRequestMethod] = useState<string>("POST");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [requestStatus, setRequestStatus] = useState<{
    success?: boolean;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<RequestTab>("body");
  const [customUrl, setCustomUrl] = useState<string>(endpoint.url);
  const [headers, setHeaders] = useState<HeaderParam[]>([
    {
      key: "Content-Type",
      value: "application/json",
      id: "default-content-type",
    },
  ]);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  // Reset custom URL when endpoint changes
  useEffect(() => {
    setCustomUrl(endpoint.url);
  }, [endpoint.url]);

  // Auto-dismiss status message after a delay
  useEffect(() => {
    if (requestStatus) {
      const timer = setTimeout(() => {
        setRequestStatus(null);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [requestStatus]);

  // Handle request builder editor mounting
  const handleRequestBuilderEditorDidMount = (editor: any) => {
    requestBuilderEditorRef.current = editor;
  };

  // Format request builder JSON
  const formatRequestBuilderJson = () => {
    if (requestBuilderEditorRef.current) {
      try {
        const content = requestBuilderEditorRef.current.getValue();
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        setRequestBuilderValue(formatted);
      } catch (err) {
        setRequestStatus({
          success: false,
          message: "Invalid JSON. Please check your request body.",
        });
      }
    }
  };

  // Add a new header
  const addHeader = () => {
    setHeaders([
      ...headers,
      { key: "", value: "", id: `header-${Date.now()}` },
    ]);
  };

  // Update a header
  const updateHeader = (id: string, field: "key" | "value", value: string) => {
    setHeaders(
      headers.map((header) =>
        header.id === id ? { ...header, [field]: value } : header,
      ),
    );
  };

  // Remove a header
  const removeHeader = (id: string) => {
    setHeaders(headers.filter((header) => header.id !== id));
  };

  // Add a new query parameter
  const addQueryParam = () => {
    setQueryParams([
      ...queryParams,
      { key: "", value: "", id: `query-${Date.now()}` },
    ]);
  };

  // Update a query parameter
  const updateQueryParam = (
    id: string,
    field: "key" | "value",
    value: string,
  ) => {
    setQueryParams(
      queryParams.map((param) =>
        param.id === id ? { ...param, [field]: value } : param,
      ),
    );
  };

  // Remove a query parameter
  const removeQueryParam = (id: string) => {
    setQueryParams(queryParams.filter((param) => param.id !== id));
  };

  // Dismiss status message
  const dismissStatus = () => {
    setRequestStatus(null);
  };

  // Build the final URL with query parameters
  const buildFinalUrl = (): string => {
    try {
      const url = new URL(customUrl);

      // Clear existing query parameters
      url.search = "";

      // Add all query parameters
      queryParams.forEach((param) => {
        if (param.key.trim()) {
          url.searchParams.append(param.key.trim(), param.value);
        }
      });

      return url.toString();
    } catch (err) {
      // If URL parsing fails, fall back to a simpler approach
      let baseUrl = customUrl;

      // Remove any existing query string
      const questionMarkIndex = baseUrl.indexOf("?");
      if (questionMarkIndex !== -1) {
        baseUrl = baseUrl.substring(0, questionMarkIndex);
      }

      // Build query string
      const queryString = queryParams
        .filter((param) => param.key.trim())
        .map(
          (param) =>
            `${encodeURIComponent(param.key.trim())}=${encodeURIComponent(param.value)}`,
        )
        .join("&");

      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }
  };

  // Send request
  const sendRequest = async () => {
    try {
      setIsSending(true);
      setRequestStatus(null);

      // Build the final URL with query parameters
      const finalUrl = buildFinalUrl();

      // Configure request options based on the HTTP method
      const requestOptions: RequestInit = {
        method: requestMethod,
        headers: {},
      };

      // Add all headers
      const headerRecord: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.key.trim()) {
          headerRecord[header.key.trim()] = header.value;
          // Also add to request options
          requestOptions.headers = {
            ...requestOptions.headers,
            [header.key.trim()]: header.value,
          };
        }
      });

      // Only add body for methods that typically include one
      if (requestMethod !== "GET" && requestMethod !== "DELETE") {
        if (requestBuilderValue !== "") {
          try {
            // Parse the JSON to validate it
            JSON.parse(requestBuilderValue);
            // Add validated body to request options
            requestOptions.body = requestBuilderValue;
          } catch (err) {
            setRequestStatus({
              success: false,
              message: "Invalid JSON. Please check your request body.",
            });
            setIsSending(false);
            return;
          }
        }
      }

      const response = await fetch(finalUrl, requestOptions);

      if (response.ok) {
        setRequestStatus({
          success: true,
          message: `Request sent successfully! Status: ${response.status}`,
        });
        // The socket will handle adding the new request to the list
      } else {
        setRequestStatus({
          success: false,
          message: `Request failed with status: ${response.status}`,
        });
      }
    } catch (err: any) {
      setRequestStatus({
        success: false,
        message: `Error sending request: ${err.message}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Request Builder</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={requestMethod}
              onChange={(e) => setRequestMethod(e.target.value)}
              className="block appearance-none rounded-md px-4 py-2 pr-8 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <button
            onClick={sendRequest}
            disabled={isSending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>

      {/* URL Input */}
      <div className="mb-4">
        <label
          htmlFor="endpoint-url"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Endpoint URL
        </label>
        <input
          type="text"
          id="endpoint-url"
          value={buildFinalUrl()}
          // readOnly
          onChange={(e) => setCustomUrl(e.target.value)}
          className="block w-full bg-gray-100 p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {requestStatus && (
        <div
          className={`mb-4 p-3 rounded-md flex justify-between items-center ${
            requestStatus.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`text-sm ${requestStatus.success ? "text-green-700" : "text-red-700"}`}
          >
            {requestStatus.message}
          </p>
          <button
            onClick={dismissStatus}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "body"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("body")}
          >
            Body
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "headers"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("headers")}
          >
            Headers
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "query"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("query")}
          >
            Query Params
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "body" && (
        <div>
          <div className="flex justify-end mb-2">
            <button
              onClick={formatRequestBuilderJson}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              Format JSON
            </button>
          </div>
          <div className="bg-gray-50 rounded-md overflow-hidden">
            <monaco.default
              height="250px"
              language="json"
              theme="vs-light"
              value={requestBuilderValue}
              onChange={(value) => setRequestBuilderValue(value || "")}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontSize: 14,
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                },
              }}
              onMount={handleRequestBuilderEditorDidMount}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Edit the JSON body above and click "Send Request" to test your
            webhook endpoint.
          </p>
        </div>
      )}

      {activeTab === "headers" && (
        <div>
          <div className="bg-gray-50 rounded-md p-4">
            {headers.length === 0 ? (
              <p className="text-sm text-gray-500">No headers added yet.</p>
            ) : (
              <div className="space-y-3">
                {headers.map((header) => (
                  <div key={header.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) =>
                        updateHeader(header.id, "key", e.target.value)
                      }
                      placeholder="Header name"
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) =>
                        updateHeader(header.id, "value", e.target.value)
                      }
                      placeholder="Value"
                      className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={() => removeHeader(header.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={addHeader}
              className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              Add Header
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Add custom headers to include in your request.
          </p>
        </div>
      )}

      {activeTab === "query" && (
        <div>
          <div className="bg-gray-50 rounded-md p-4">
            {queryParams.length === 0 ? (
              <p className="text-sm text-gray-500">
                No query parameters added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {queryParams.map((param) => (
                  <div key={param.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) =>
                        updateQueryParam(param.id, "key", e.target.value)
                      }
                      placeholder="Parameter name"
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) =>
                        updateQueryParam(param.id, "value", e.target.value)
                      }
                      placeholder="Value"
                      className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={() => removeQueryParam(param.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={addQueryParam}
              className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              Add Query Parameter
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Add query parameters to append to the URL.
          </p>
        </div>
      )}

      {/* Preview of the final URL */}
      <div className="mt-4 p-3 bg-gray-100 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          Request Preview
        </h3>
        <div className="text-xs font-mono break-all text-gray-600">
          {requestMethod} {buildFinalUrl()}
        </div>
      </div>
    </div>
  );
}
