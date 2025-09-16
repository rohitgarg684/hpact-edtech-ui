import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'highlight.js/styles/atom-one-dark.css';

interface MessageContentProps {
  content: string;
  isUser?: boolean;
}

// Post-process OpenAI responses to ensure proper formatting
function processOpenAIResponse(content: string): string {
  // Handle various OpenAI response formats
  let processed = content;
  
  // Fix common formatting issues
  processed = processed
    // Ensure proper line breaks for lists
    .replace(/(\d+\.\s)/g, '\n$1')
    .replace(/([•\-\*]\s)/g, '\n$1')
    // Fix code block formatting
    .replace(/```(\w+)?\n?/g, '\n```$1\n')
    // Ensure proper spacing around headers
    .replace(/#{1,6}\s/g, '\n$&')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return processed;
}

// Custom code block component with syntax highlighting
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  
  return !inline && match ? (
    <div className="relative my-4">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-md text-sm">
        <span className="font-medium">{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
          className="text-gray-300 hover:text-white transition-colors"
          title="Copy code"
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="!mt-0 !rounded-t-none"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  );
};

// Custom link component
const LinkRenderer = ({ href, children, ...props }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 dark:text-blue-400 hover:underline"
    {...props}
  >
    {children}
  </a>
);

// Custom list components for better styling
const ListRenderer = ({ ordered, children, ...props }: any) => {
  const Component = ordered ? 'ol' : 'ul';
  return (
    <Component className={`my-2 ${ordered ? 'list-decimal' : 'list-disc'} list-inside space-y-1`} {...props}>
      {children}
    </Component>
  );
};

const ListItemRenderer = ({ children, ...props }: any) => (
  <li className="ml-4" {...props}>{children}</li>
);

// Custom paragraph renderer for better spacing
const ParagraphRenderer = ({ children, ...props }: any) => (
  <p className="mb-3 last:mb-0" {...props}>{children}</p>
);

// Custom heading renderers
const HeadingRenderer = ({ level, children, ...props }: any) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClasses = {
    1: 'text-2xl font-bold mb-4 mt-6',
    2: 'text-xl font-bold mb-3 mt-5',
    3: 'text-lg font-bold mb-2 mt-4',
    4: 'text-base font-bold mb-2 mt-3',
    5: 'text-sm font-bold mb-1 mt-2',
    6: 'text-xs font-bold mb-1 mt-2',
  };
  
  return (
    <Tag className={sizeClasses[level as keyof typeof sizeClasses] || sizeClasses[6]} {...props}>
      {children}
    </Tag>
  );
};

// Custom blockquote renderer
const BlockquoteRenderer = ({ children, ...props }: any) => (
  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-700 dark:text-gray-300" {...props}>
    {children}
  </blockquote>
);

export default function MessageContent({ content, isUser = false }: MessageContentProps) {
  // For user messages, render as simple text
  if (isUser) {
    return (
      <p className="text-sm whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  // For AI messages, process and render as markdown
  const processedContent = processOpenAIResponse(content);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: CodeBlock,
          a: LinkRenderer,
          ul: ({ children, ...props }) => <ListRenderer ordered={false} {...props}>{children}</ListRenderer>,
          ol: ({ children, ...props }) => <ListRenderer ordered={true} {...props}>{children}</ListRenderer>,
          li: ListItemRenderer,
          p: ParagraphRenderer,
          h1: ({ children, ...props }) => <HeadingRenderer level={1} {...props}>{children}</HeadingRenderer>,
          h2: ({ children, ...props }) => <HeadingRenderer level={2} {...props}>{children}</HeadingRenderer>,
          h3: ({ children, ...props }) => <HeadingRenderer level={3} {...props}>{children}</HeadingRenderer>,
          h4: ({ children, ...props }) => <HeadingRenderer level={4} {...props}>{children}</HeadingRenderer>,
          h5: ({ children, ...props }) => <HeadingRenderer level={5} {...props}>{children}</HeadingRenderer>,
          h6: ({ children, ...props }) => <HeadingRenderer level={6} {...props}>{children}</HeadingRenderer>,
          blockquote: BlockquoteRenderer,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}