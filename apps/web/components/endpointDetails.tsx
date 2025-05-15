"use client";

import { useState } from "react";

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

interface EndpointDetailsProps {
  endpoint: Endpoint;
  socketConnected: boolean;
  requestBuilderValue: string;
  onReconnect: () => void;
  onDelete: () => void;
}

export default function EndpointDetails({
  endpoint,
  socketConnected,
  requestBuilderValue,
  onReconnect,
  onDelete,
}: EndpointDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);

  // Copy webhook URL to clipboard
  const copyUrl = () => {
    navigator.clipboard.writeText(endpoint.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sample JSON for curl example
  // const sampleJson = '{\n  "event": "test",\n  "data": {\n    "message": "Hello World!"\n  }\n}'

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{endpoint.name}</h1>
          {endpoint.description && (
            <p className="mt-1 text-gray-500">{endpoint.description}</p>
          )}
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">Created:</span>
              <span className="ml-2 text-sm text-gray-700">
                {new Date(endpoint.createdAt).toLocaleString().split(",")}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500">Expires:</span>
              <span className="ml-2 text-sm text-gray-700">
                {endpoint.isPersistent
                  ? "Never (Persistent)"
                  : new Date(endpoint.expiresAt).toLocaleString().split(",")}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500">Socket Status:</span>
              <span
                className={`ml-2 text-sm ${socketConnected ? "text-green-600" : "text-red-600"}`}
              >
                {socketConnected ? "Connected" : "Disconnected"}
              </span>
              <button
                onClick={onReconnect}
                className="ml-3 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Reconnect
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete Endpoint
        </button>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">
          Webhook URL
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex items-stretch flex-grow">
            <input
              type="text"
              readOnly
              value={endpoint.url}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50 px-4"
            />
          </div>
          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex items-center px-6 py-2 border border-l-2 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Send HTTP requests to this URL to test your webhooks
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900">Test with cURL</h2>
        <div className="mt-2 bg-gray-800 rounded-md p-4 relative h-55">
          <div className="overflow-y-auto h-full">
            <pre className="text-sm text-gray-200 whitespace-pre-wrap">
              {`curl -X POST ${endpoint.url} \\
-H "Content-Type: application/json" \\
${requestBuilderValue}`}
            </pre>
          </div>
          <button
            onClick={() => {
              const curlCommand = `curl -X POST ${endpoint.url} \\
-H "Content-Type: application/json" \\
${requestBuilderValue}`;
              navigator.clipboard.writeText(curlCommand);
              setCurlCopied(true);
              setTimeout(() => {
                setCurlCopied(false);
              }, 2000);
            }}
            className="absolute top-4 right-10 bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {curlCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
