"use client";

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import MonacoEditor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

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

interface RequestSectionProps {
  requests: WebhookRequest[];
  onDeleteRequest: (requestId: string) => Promise<void>;
}

export default function RequestSection({
  requests,
  onDeleteRequest,
}: RequestSectionProps) {
  const [selectedRequest, setSelectedRequest] = useState<WebhookRequest | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"headers" | "body" | "query">(
    "body",
  );
  const [editorValue, setEditorValue] = useState<string>("");
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Update editor content when selected request changes
  useEffect(() => {
    if (selectedRequest) {
      const formattedJson = formatJson(selectedRequest.body);
      setEditorValue(formattedJson);
    } else {
      setEditorValue("");
    }
  }, [selectedRequest]);

  // Format JSON for display
  const formatJson = (data: Record<string, unknown> | string) => {
    try {
      if (typeof data === "string") {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch (_: unknown) {
      return typeof data === "string" ? data : JSON.stringify(data);
    }
  };

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Copy editor content
  const copyEditorContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.getValue();
      navigator.clipboard.writeText(content);
      // Show a temporary copied message
      const originalValue = editorValue;
      setEditorValue("// Copied to clipboard!");
      setTimeout(() => {
        setEditorValue(originalValue);
      }, 1000);
    }
  };

  // Format editor content
  const formatEditorContent = () => {
    if (editorRef.current) {
      try {
        const content = editorRef.current.getValue();
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        setEditorValue(formatted);
      } catch (err) {
        console.error("Error formatting JSON:", err instanceof Error ? err.message : err);
      }
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Webhook Requests</h2>
        <p className="mt-1 text-sm text-gray-500">
          Requests are shown in real-time as they arrive
        </p>
      </div>

      <div className="flex h-[600px]">
        {/* Request list */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {requests.length === 0 ? (
            <div className="p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No requests yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Send a request to your webhook URL to see it here
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                    selectedRequest?.id === request.id ? "bg-indigo-50" : ""
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.method === "POST"
                          ? "bg-green-100 text-green-800"
                          : request.method === "GET"
                            ? "bg-blue-100 text-blue-800"
                            : request.method === "PUT"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.method === "DELETE"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {request.method}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[70%]">
                      {request.ip}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRequest(request.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Request details */}
        <div className="w-2/3 overflow-y-auto">
          {selectedRequest ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Request Details
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </span>
              </div>

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

              {activeTab === "body" && (
                <div>
                  <div className="flex justify-end mb-2 space-x-2">
                    <button
                      onClick={formatEditorContent}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      Format
                    </button>
                    <button
                      onClick={copyEditorContent}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <MonacoEditor
                      height="300px"
                      language="json"
                      theme="vs-light"
                      value={editorValue}
                      options={{
                        readOnly: false,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontSize: 14,
                        scrollbar: {
                          vertical: "visible",
                          horizontal: "visible",
                        },
                      }}
                      onMount={handleEditorDidMount}
                    />
                  </div>
                </div>
              )}

              {activeTab === "headers" && (
                <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
                  <div className="space-y-2">
                    {Object.entries(selectedRequest.headers).map(
                      ([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-4">
                          <div className="text-sm font-medium text-gray-500">
                            {key}
                          </div>
                          <div className="col-span-2 text-sm text-gray-900 break-all">
                            {typeof value === "string"
                              ? value
                              : JSON.stringify(value)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {activeTab === "query" && (
                <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
                  <div className="space-y-2">
                    {Object.keys(selectedRequest.queryParams).length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No query parameters
                      </p>
                    ) : (
                      Object.entries(selectedRequest.queryParams).map(
                        ([key, value]) => (
                          <div key={key} className="grid grid-cols-3 gap-4">
                            <div className="text-sm font-medium text-gray-500">
                              {key}
                            </div>
                            <div className="col-span-2 text-sm text-gray-900 break-all">
                              {typeof value === "string"
                                ? value
                                : JSON.stringify(value)}
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    IP Address
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.ip}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    User Agent
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 truncate">
                    {selectedRequest.userAgent}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center">
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Select a request to view details
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
