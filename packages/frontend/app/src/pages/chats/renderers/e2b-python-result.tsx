import { t } from '@/lib/i18n';
import { CodeIcon, EmptyIcon } from '@blocksuite/icons/rc';

import { MarkdownText } from '@/components/ui/markdown';

import { GenericToolResult } from './generic-tool-result';

// Type matching the e2b-python-sandbox tool return
type ProcessedResult = {
  extra?: any;
  text?: string;
  html?: string;
  markdown?: string;
  svg?: string;
  png?: string; // URL to saved image
  jpeg?: string; // URL to saved image
  pdf?: string; // URL to saved document
  latex?: string;
  json?: string;
  javascript?: string;
  data?: Record<string, unknown>;
  chart?: any;
  [key: string]: any;
};

type E2bPythonResultError = {
  name: string;
  value: string;
  traceback: string;
};

type E2bPythonResultType = {
  logs: {
    stdout?: string[];
    stderr?: string[];
  };
  error?: E2bPythonResultError;
  result: ProcessedResult[];
};

export const E2bPythonResult = ({
  result,
}: {
  result: E2bPythonResultType;
}) => {
  const { result: processedResultsRaw, logs: { stdout } = {} } = result;
  let error = result.error;
  let processedResults: ProcessedResult[] = [];

  try {
    if (processedResultsRaw && processedResultsRaw.length) {
      processedResults =
        typeof processedResultsRaw === 'string'
          ? JSON.parse(processedResultsRaw)
          : processedResultsRaw;
    } else if (stdout && stdout.length) {
      processedResults = stdout
        .map(item => item.trim())
        .filter(Boolean)
        .map(text => ({ text }));
    } else {
      throw new Error(t("No results found"));
    }
  } catch (e) {
    error = {
      name: t("Error"),
      value: 'Invalid JSON',
      traceback: e instanceof Error ? e.message : t("Unexpected error"),
    };
  }

  if (error) {
    const errorText = `${error.name}: ${error.value}\n${error.traceback}`;
    return (
      <GenericToolResult
        icon={<EmptyIcon className="text-red-500" />}
        title={t("Errored")}
      >
        <div className="text-sm px-10 py-4 text-red-500">
          <MarkdownText text={errorText} />
        </div>
      </GenericToolResult>
    );
  }

  // Handle empty results
  if (!processedResults || processedResults.length === 0) {
    return (
      <GenericToolResult icon={<CodeIcon />} title={t("Result")}>
        <div className="text-sm px-10 py-4 text-gray-500">{t("No output")}</div>
      </GenericToolResult>
    );
  }

  return (
    <GenericToolResult icon={<CodeIcon />} title={t("Result")}>
      <div className="text-sm px-10 py-4 space-y-4">
        {processedResults?.map((item, index) => (
          <div
            key={index}
            className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
          >
            {/* Render images if available */}
            {item.png && (
              <div className="mb-2">
                <img src={item.png} alt={t("Plot")} className="max-w-full" />
              </div>
            )}
            {item.jpeg && (
              <div className="mb-2">
                <img src={item.jpeg} alt={t("Image")} className="max-w-full" />
              </div>
            )}
            {item.svg && (
              <div
                className="mb-2"
                dangerouslySetInnerHTML={{ __html: item.svg }}
              />
            )}

            {/* Render text content */}
            {item.markdown && <MarkdownText text={item.markdown} />}
            {!item.markdown && item.html && (
              <div dangerouslySetInnerHTML={{ __html: item.html }} />
            )}
            {!item.markdown && !item.html && item.text && (
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {item.text}
              </pre>
            )}

            {/* Render JSON data */}
            {item.json && (
              <pre className="bg-gray-50 p-2 rounded overflow-x-auto">
                <code className="text-xs">
                  {JSON.stringify(JSON.parse(item.json), null, 2)}
                </code>
              </pre>
            )}

            {/* Render DataFrame data */}
            {item.data && (
              <div className="overflow-x-auto">
                <pre className="bg-gray-50 p-2 rounded">
                  <code className="text-xs">
                    {JSON.stringify(item.data, null, 2)}
                  </code>
                </pre>
              </div>
            )}

            {/* PDF link */}
            {item.pdf && (
              <div className="mt-2">
                <a
                  href={item.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >{t("📄 View PDF")}</a>
              </div>
            )}
          </div>
        ))}
      </div>
    </GenericToolResult>
  );
};
