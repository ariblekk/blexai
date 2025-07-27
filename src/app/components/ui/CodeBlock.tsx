'use client';

import { useState } from 'react';
import { Copy, Check, Eye, ChevronDown, ChevronUp, WrapText } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [wrapped, setWrapped] = useState(true); // Default ke true agar konten dibungkus

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Fungsi untuk syntax highlighting yang diperbaiki dan konsisten
  const highlightCode = (code: string, language: string) => {
    // Escape HTML untuk mencegah konflik
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // Fungsi helper untuk menghindari re-highlighting
    const protectSpans = (text: string) => {
      const spans: string[] = [];
      let counter = 0;
      
      // Simpan semua span yang sudah ada
      const withPlaceholders = text.replace(/<span[^>]*>.*?<\/span>/g, (match) => {
        const placeholder = `__SPAN_${counter}__`;
        spans[counter] = match;
        counter++;
        return placeholder;
      });
      
      return { text: withPlaceholders, spans };
    };
    
    const restoreSpans = (text: string, spans: string[]) => {
      let result = text;
      spans.forEach((span, index) => {
        result = result.replace(`__SPAN_${index}__`, span);
      });
      return result;
    };
  
    if (!language) return escapeHtml(code);
  
    let highlightedCode = escapeHtml(code);
    const lang = language.toLowerCase();
  
    // HTML/XML/SVG highlighting
    if (['html', 'xml', 'svg'].includes(lang)) {
      // 1. Comments
      highlightedCode = highlightedCode.replace(
        /(&lt;!--[\s\S]*?--&gt;)/g,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 2. DOCTYPE
      highlightedCode = highlightedCode.replace(
        /(&lt;!)([A-Z]+)(\s[^&gt;]*&gt;)/g,
        '<span style="color: #569CD6;">$1$2$3</span>'
      );
      
      // 3. CDATA
      highlightedCode = highlightedCode.replace(
        /(&lt;!\[CDATA\[[\s\S]*?\]\]&gt;)/g,
        '<span style="color: #CE9178;">$1</span>'
      );
      
      // 4. Tag structure dengan attribute highlighting yang lebih baik
      highlightedCode = highlightedCode.replace(
        /(&lt;\/?)(\w+)((?:\s+[^&gt;]*)?&gt;)/g,
        (match, open, tagName, rest) => {
          // Highlight attributes
          const highlightedRest = rest.replace(
            /(\s+)(\w+[-\w]*)(=)(&quot;[^&quot;]*&quot;|&#39;[^&#39;]*&#39;|[^\s&gt;]+)/g,
            '$1<span style="color: #92C5F7;">$2</span><span style="color: #D4D4D4;">$3</span><span style="color: #CE9178;">$4</span>'
          );
          
          return `<span style="color: #808080;">${open}</span><span style="color: #4FC1FF; font-weight: 600;">${tagName}</span>${highlightedRest}`;
        }
      );
    }
    
    // JavaScript/TypeScript/JSX/TSX highlighting
    else if (['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(lang)) {
      // 1. Multi-line comments terlebih dahulu
      highlightedCode = highlightedCode.replace(
        /(\/\*[\s\S]*?\*\/)/g,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 2. Single-line comments
      highlightedCode = highlightedCode.replace(
        /(^\/\/.*$)/gm,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 3. Template literals
      highlightedCode = highlightedCode.replace(
        /(`)((?:[^`\\]|\\[\s\S])*?)(`)/g,
        '<span style="color: #CE9178;">$1$2$3</span>'
      );
      
      // 4. String literals
      highlightedCode = highlightedCode.replace(
        /(['"])((?:[^'"\\]|\\[\s\S])*?)\1/g,
        '<span style="color: #CE9178;">$1$2$1</span>'
      );
      
      // 5. JSX/TSX tags (setelah string untuk menghindari konflik)
      if (['jsx', 'tsx'].includes(lang)) {
        const { text, spans } = protectSpans(highlightedCode);
        const withJSX = text.replace(
          /(&lt;\/?)(\w+)((?:\s+[^&gt;]*)?&gt;)/g,
          '<span style="color: #808080;">$1</span><span style="color: #4FC1FF; font-weight: 600;">$2</span><span style="color: #92C5F7;">$3</span>'
        );
        highlightedCode = restoreSpans(withJSX, spans);
      }
      
      // 6. Keywords
      const { text: protectedText, spans: protectedSpans } = protectSpans(highlightedCode);
      const withKeywords = protectedText.replace(
        /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new|this|super|extends|implements|interface|type|enum|public|private|protected|static|readonly|abstract|declare|namespace|module|as|keyof|typeof|instanceof|in|of|break|continue|switch|case|do|finally|with|yield|delete|void|undefined|null|true|false)\b/g,
        '<span style="color: #569CD6; font-weight: 600;">$1</span>'
      );
      highlightedCode = restoreSpans(withKeywords, protectedSpans);
      
      // 7. TypeScript types
      if (['typescript', 'ts', 'tsx'].includes(lang)) {
        const { text: tsText, spans: tsSpans } = protectSpans(highlightedCode);
        const withTypes = tsText.replace(
          /\b(any|unknown|never|object|string|number|boolean|symbol|bigint|Record|Partial|Required|Pick|Omit|Exclude|Extract|NonNullable|Parameters|ReturnType|ConstructorParameters|InstanceType)\b/g,
          '<span style="color: #4EC9B0; font-weight: 600;">$1</span>'
        );
        highlightedCode = restoreSpans(withTypes, tsSpans);
      }
      
      // 8. Numbers
      const { text: numText, spans: numSpans } = protectSpans(highlightedCode);
      const withNumbers = numText.replace(
        /\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g,
        '<span style="color: #B5CEA8;">$1</span>'
      );
      highlightedCode = restoreSpans(withNumbers, numSpans);
      
      // 9. Function calls
      const { text: funcText, spans: funcSpans } = protectSpans(highlightedCode);
      const withFunctions = funcText.replace(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
        '<span style="color: #DCDCAA;">$1</span>'
      );
      highlightedCode = restoreSpans(withFunctions, funcSpans);
      
      // 10. Object properties
      const { text: propText, spans: propSpans } = protectSpans(highlightedCode);
      const withProperties = propText.replace(
        /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        '.<span style="color: #9CDCFE;">$1</span>'
      );
      highlightedCode = restoreSpans(withProperties, propSpans);
    }
    
    // Python highlighting
    else if (['python', 'py'].includes(lang)) {
      // 1. Comments
      highlightedCode = highlightedCode.replace(
        /(^#.*$)/gm,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 2. Triple quoted strings
      highlightedCode = highlightedCode.replace(
        /(['"`]{3})([\s\S]*?)\1/g,
        '<span style="color: #CE9178;">$1$2$1</span>'
      );
      
      // 3. f-strings
      highlightedCode = highlightedCode.replace(
        /\b(f)(['"`])([^'"\`]*?)\2/g,
        '<span style="color: #569CD6;">$1</span><span style="color: #CE9178;">$2$3$2</span>'
      );
      
      // 4. Regular strings
      highlightedCode = highlightedCode.replace(
        /(['"`])([^'"\`\\]*(?:\\[\s\S][^'"\`\\]*)*)\1/g,
        '<span style="color: #CE9178;">$1$2$1</span>'
      );
      
      // 5. Keywords
      const { text: pyText, spans: pySpans } = protectSpans(highlightedCode);
      const withPyKeywords = pyText.replace(
        /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|break|continue|pass|lambda|and|or|not|in|is|None|True|False|self|super|global|nonlocal|async|await|raise|assert|del|exec)\b/g,
        '<span style="color: #569CD6; font-weight: 600;">$1</span>'
      );
      highlightedCode = restoreSpans(withPyKeywords, pySpans);
      
      // 6. Built-in functions
      const { text: builtinText, spans: builtinSpans } = protectSpans(highlightedCode);
      const withBuiltins = builtinText.replace(
        /\b(print|len|range|str|int|float|list|dict|tuple|set|bool|type|isinstance|hasattr|getattr|setattr|delattr|dir|vars|globals|locals|eval|open|input|abs|min|max|sum|sorted|reversed|enumerate|zip|map|filter|all|any|round|pow|divmod|bin|oct|hex|ord|chr|repr|format|slice|iter|next|callable|property|staticmethod|classmethod|super|__import__)(?=\s*\()/g,
        '<span style="color: #DCDCAA;">$1</span>'
      );
      highlightedCode = restoreSpans(withBuiltins, builtinSpans);
      
      // 7. Numbers
      const { text: pyNumText, spans: pyNumSpans } = protectSpans(highlightedCode);
      const withPyNumbers = pyNumText.replace(
        /\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g,
        '<span style="color: #B5CEA8;">$1</span>'
      );
      highlightedCode = restoreSpans(withPyNumbers, pyNumSpans);
      
      // 8. Function definitions
      const { text: defText, spans: defSpans } = protectSpans(highlightedCode);
      const withDefs = defText.replace(
        /\b(def)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        '<span style="color: #569CD6; font-weight: 600;">$1</span> <span style="color: #DCDCAA; font-weight: 600;">$2</span>'
      );
      highlightedCode = restoreSpans(withDefs, defSpans);
      
      // 9. Class definitions
      const { text: classText, spans: classSpans } = protectSpans(highlightedCode);
      const withClasses = classText.replace(
        /\b(class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        '<span style="color: #569CD6; font-weight: 600;">$1</span> <span style="color: #4EC9B0; font-weight: 600;">$2</span>'
      );
      highlightedCode = restoreSpans(withClasses, classSpans);
      
      // 10. Decorators
      const { text: decText, spans: decSpans } = protectSpans(highlightedCode);
      const withDecorators = decText.replace(
        /@([a-zA-Z_][a-zA-Z0-9_]*)/g,
        '<span style="color: #DCDCAA;">@$1</span>'
      );
      highlightedCode = restoreSpans(withDecorators, decSpans);
    }
    
    // CSS/SCSS/SASS/LESS highlighting
    else if (['css', 'scss', 'sass', 'less'].includes(lang)) {
      // 1. Multi-line comments
      highlightedCode = highlightedCode.replace(
        /(\/\*[\s\S]*?\*\/)/g,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 2. Single-line comments (SCSS/SASS)
      if (['scss', 'sass'].includes(lang)) {
        highlightedCode = highlightedCode.replace(
          /(^\/\/.*$)/gm,
          '<span style="color: #6A9955; font-style: italic;">$1</span>'
        );
      }
      
      // 3. At-rules
      const { text: atText, spans: atSpans } = protectSpans(highlightedCode);
      const withAtRules = atText.replace(
        /@([a-zA-Z-]+)/g,
        '<span style="color: #569CD6; font-weight: 600;">@$1</span>'
      );
      highlightedCode = restoreSpans(withAtRules, atSpans);
      
      // 4. Selectors
      const { text: selText, spans: selSpans } = protectSpans(highlightedCode);
      const withSelectors = selText.replace(
        /^([^{]+)(?={)/gm,
        '<span style="color: #D7BA7D;">$1</span>'
      );
      highlightedCode = restoreSpans(withSelectors, selSpans);
      
      // 5. Properties
      const { text: propCssText, spans: propCssSpans } = protectSpans(highlightedCode);
      const withCssProperties = propCssText.replace(
        /(\w+[-\w]*)(\s*:)/g,
        '<span style="color: #9CDCFE;">$1</span><span style="color: #D4D4D4;">$2</span>'
      );
      highlightedCode = restoreSpans(withCssProperties, propCssSpans);
      
      // 6. Values
      const { text: valText, spans: valSpans } = protectSpans(highlightedCode);
      const withValues = valText.replace(
        /(:)(\s*)([^;\n}]+)/g,
        '$1$2<span style="color: #CE9178;">$3</span>'
      );
      highlightedCode = restoreSpans(withValues, valSpans);
      
      // 7. !important
      const { text: impText, spans: impSpans } = protectSpans(highlightedCode);
      const withImportant = impText.replace(
        /(!important)/g,
        '<span style="color: #FF6B6B; font-weight: 600;">$1</span>'
      );
      highlightedCode = restoreSpans(withImportant, impSpans);
    }
    
    // JSON highlighting
    else if (lang === 'json') {
      // 1. Strings
      highlightedCode = highlightedCode.replace(
        /(&quot;)([^&quot;\\]*(?:\\[\s\S][^&quot;\\]*)*)(&quot;)/g,
        '<span style="color: #CE9178;">$1$2$3</span>'
      );
      
      // 2. Numbers
      const { text: jsonNumText, spans: jsonNumSpans } = protectSpans(highlightedCode);
      const withJsonNumbers = jsonNumText.replace(
        /\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
        '<span style="color: #B5CEA8;">$1</span>'
      );
      highlightedCode = restoreSpans(withJsonNumbers, jsonNumSpans);
      
      // 3. Booleans and null
      const { text: jsonBoolText, spans: jsonBoolSpans } = protectSpans(highlightedCode);
      const withJsonBools = jsonBoolText.replace(
        /\b(true|false|null)\b/g,
        '<span style="color: #569CD6; font-weight: 600;">$1</span>'
      );
      highlightedCode = restoreSpans(withJsonBools, jsonBoolSpans);
    }
    
    // SQL highlighting
    else if (lang === 'sql') {
      // 1. Comments
      highlightedCode = highlightedCode.replace(
        /(--.*$)/gm,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 2. String literals
      highlightedCode = highlightedCode.replace(
        /(['])([^'\\]*(?:\\[\s\S][^'\\]*)*)\1/g,
        '<span style="color: #CE9178;">$1$2$1</span>'
      );
      
      // 3. Keywords
      const { text: sqlText, spans: sqlSpans } = protectSpans(highlightedCode);
      const withSqlKeywords = sqlText.replace(
        /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|DATABASE|SCHEMA|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|UNIQUE|DEFAULT|CHECK|CONSTRAINT|AUTO_INCREMENT|IDENTITY|SEQUENCE|TRIGGER|PROCEDURE|FUNCTION|IF|ELSE|WHILE|FOR|LOOP|BEGIN|END|DECLARE|SET|EXEC|EXECUTE|RETURN|CASE|WHEN|THEN|AS|AND|OR|IN|EXISTS|BETWEEN|LIKE|IS|DISTINCT|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|USING|CROSS|NATURAL|ASC|DESC|COUNT|SUM|AVG|MIN|MAX|CAST|CONVERT|SUBSTRING|UPPER|LOWER|TRIM|COALESCE|ISNULL|NULLIF)\b/gi,
        '<span style="color: #569CD6; font-weight: 600;">$1</span>'
      );
      highlightedCode = restoreSpans(withSqlKeywords, sqlSpans);
      
      // 4. Numbers
      const { text: sqlNumText, spans: sqlNumSpans } = protectSpans(highlightedCode);
      const withSqlNumbers = sqlNumText.replace(
        /\b(\d+(?:\.\d+)?)\b/g,
        '<span style="color: #B5CEA8;">$1</span>'
      );
      highlightedCode = restoreSpans(withSqlNumbers, sqlNumSpans);
    }
    
    // PHP highlighting
    else if (lang === 'php') {
      // 1. Comments
      highlightedCode = highlightedCode.replace(
        /(^\/\/.*$|^#.*$)/gm,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 2. Multi-line comments
      highlightedCode = highlightedCode.replace(
        /(\/\*[\s\S]*?\*\/)/g,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 3. PHP tags
      highlightedCode = highlightedCode.replace(
        /(&lt;\?php|&lt;\?|\?&gt;)/g,
        '<span style="color: #569CD6; font-weight: 600;">$1</span>'
      );
      
      // 4. String literals
      highlightedCode = highlightedCode.replace(
        /(['"])([^'"\\]*(?:\\[\s\S][^'"\\]*)*)\1/g,
        '<span style="color: #CE9178;">$1$2$1</span>'
      );
      
      // 5. Variables
      const { text: phpVarText, spans: phpVarSpans } = protectSpans(highlightedCode);
      const withPhpVars = phpVarText.replace(
        /(\$[a-zA-Z_][a-zA-Z0-9_]*)/g,
        '<span style="color: #9CDCFE;">$1</span>'
      );
      highlightedCode = restoreSpans(withPhpVars, phpVarSpans);
      
      // 6. Keywords
      const { text: phpText, spans: phpSpans } = protectSpans(highlightedCode);
      const withPhpKeywords = phpText.replace(
        /\b(abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|namespace|new|or|print|private|protected|public|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/g,
        '<span style="color: #569CD6; font-weight: 600;">$1</span>'
      );
      highlightedCode = restoreSpans(withPhpKeywords, phpSpans);
    }
    
    // Bash/Shell highlighting
    else if (['bash', 'sh', 'shell', 'zsh'].includes(lang)) {
      // 1. Comments
      highlightedCode = highlightedCode.replace(
        /(^#.*$)/gm,
        '<span style="color: #6A9955; font-style: italic;">$1</span>'
      );
      
      // 2. String literals
      highlightedCode = highlightedCode.replace(
        /(['"])([^'"\\]*(?:\\[\s\S][^'"\\]*)*)\1/g,
        '<span style="color: #CE9178;">$1$2$1</span>'
      );
      
      // 3. Variables
      const { text: bashVarText, spans: bashVarSpans } = protectSpans(highlightedCode);
      const withBashVars = bashVarText.replace(
        /(\$[a-zA-Z_][a-zA-Z0-9_]*|\$\{[^}]+\}|\$\d+|\$\*|\$@|\$\?|\$\$|\$!)/g,
        '<span style="color: #9CDCFE;">$1</span>'
      );
      highlightedCode = restoreSpans(withBashVars, bashVarSpans);
      
      // 4. Command substitution
      const { text: bashCmdText, spans: bashCmdSpans } = protectSpans(highlightedCode);
      const withBashCmds = bashCmdText.replace(
        /(\$\([^)]+\)|`[^`]+`)/g,
        '<span style="color: #DCDCAA;">$1</span>'
      );
      highlightedCode = restoreSpans(withBashCmds, bashCmdSpans);
      
      // 5. Keywords
      const { text: bashText, spans: bashSpans } = protectSpans(highlightedCode);
      const withBashKeywords = bashText.replace(
        /\b(if|then|else|elif|fi|case|esac|for|while|until|do|done|function|return|exit|break|continue|local|export|readonly|declare|typeset|unset|shift|eval|exec|source|alias|unalias|history|jobs|bg|fg|nohup|disown|kill|killall|ps|top|grep|awk|sed|sort|uniq|head|tail|cat|less|more|find|locate|which|whereis|file|stat|ls|dir|pwd|cd|mkdir|rmdir|rm|cp|mv|ln|chmod|chown|chgrp|umask|mount|umount|df|du|free|uname|whoami|id|groups|su|sudo|passwd|crontab|at|batch|sleep|wait|trap|test|true|false|yes|no|echo|printf|read|select)\b/g,
        '<span style="color: #569CD6; font-weight: 600;">$1</span>'
      );
      highlightedCode = restoreSpans(withBashKeywords, bashSpans);
    }

    return highlightedCode;
  };

  const addLineNumbers = (code: string) => {
    const lines = code.split('\n');
    const maxLineNumber = lines.length;
    const lineNumberWidth = Math.max(2.5, maxLineNumber.toString().length * 0.6 + 1.5);
    
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      return `<div class="flex hover:bg-gray-800/20 transition-colors group" style="min-height: 1.5rem;">
        <span class="select-none text-gray-500 text-right pr-3 pl-2 border-r border-gray-700 bg-[#252526] group-hover:bg-gray-700/30 flex-shrink-0" style="width: ${lineNumberWidth}rem; font-size: 0.75rem; line-height: 1.5rem; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; display: flex; align-items: center; justify-content: flex-end;">${lineNumber}</span>
        <span class="flex-1 pl-3 pr-2" style="line-height: 1.5rem; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; white-space: pre-wrap; overflow-wrap: break-word;">${line || '&nbsp;'}</span>
      </div>`;
    }).join('');
  };

  const processedCode = highlightCode(code, language || '');
  const codeWithLineNumbers = addLineNumbers(processedCode);

  return (
    <div className="relative bg-[#1e1e1e] border border-gray-600 rounded-lg overflow-hidden my-4 shadow-xl w-full max-w-full">
      {/* Header dengan tombol aksi */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 bg-[#2d2d30] border-b border-gray-600 flex-shrink-0 flex-wrap gap-1">
        <div className="flex items-center space-x-1">
          <span className="text-xs sm:text-sm text-gray-300 font-mono px-2 py-1 bg-[#3c3c3c] rounded">
            {language || 'plaintext'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 flex-wrap">
          <button 
            onClick={() => setWrapped(!wrapped)}
            className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
              wrapped ? 'text-blue-400 bg-blue-900/30' : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            <WrapText className="w-3 h-3" />
            <span className="hidden sm:inline">Wrap</span>
          </button>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600 rounded transition-colors"
          >
            {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            <span className="hidden sm:inline">Collapse</span>
          </button>
          
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {!collapsed && (
        <div className={`bg-[#1e1e1e] w-full overflow-x-auto`}>
          <pre className={`text-xs sm:text-sm font-mono text-[#d4d4d4] w-full ${wrapped ? 'whitespace-pre-wrap' : 'whitespace-pre'}`} style={{ margin: 0, padding: 0 }}>
            <code 
              className="block w-full"
              dangerouslySetInnerHTML={{
                __html: codeWithLineNumbers
              }}
            />
          </pre>
        </div>
      )}
    </div>
  );
};