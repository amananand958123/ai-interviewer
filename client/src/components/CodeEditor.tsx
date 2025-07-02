import { useRef, useEffect, useState } from 'react'
import * as monaco from 'monaco-editor'
import { Play, Download, RotateCcw, Settings } from 'lucide-react'

interface CodeEditorProps {
  language?: string
  value?: string
  onChange?: (value: string) => void
  onExecute?: (code: string) => void
  onLanguageChange?: (language: string) => void
  className?: string
  readOnly?: boolean
  showLanguageSelector?: boolean
  boilerplateCode?: string // New prop for boilerplate code
}

// Configure Monaco environment once outside the component
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
})

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
})

// Enable error reporting for other languages
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2020,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  esModuleInterop: true,
  jsx: monaco.languages.typescript.JsxEmit.React,
  reactNamespace: 'React',
  allowJs: true,
  typeRoots: ['node_modules/@types']
})

export default function CodeEditor({
  language = 'javascript',
  value = '',
  onChange,
  onExecute,
  onLanguageChange,
  className = '',
  readOnly = false,
  showLanguageSelector = false,
  boilerplateCode = ''
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [showSettings, setShowSettings] = useState(false)
  const [syntaxErrors, setSyntaxErrors] = useState<any[]>([])

  // Monitor for syntax errors
  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel()
      if (model) {
        const updateErrors = () => {
          const markers = monaco.editor.getModelMarkers({ resource: model.uri })
          const errors = markers.filter(marker => 
            marker.severity === monaco.MarkerSeverity.Error ||
            marker.severity === monaco.MarkerSeverity.Warning
          )
          setSyntaxErrors(errors)
        }

        // Initial check
        updateErrors()

        // Set up error monitoring
        const disposable = monaco.editor.onDidChangeMarkers(() => {
          updateErrors()
        })

        return () => disposable.dispose()
      }
    }
  }, [monacoRef.current, language])

  useEffect(() => {
    if (editorRef.current) {
      // Create editor
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: 'vs-dark',
        fontSize,
        fontFamily: 'JetBrains Mono, Monaco, "Courier New", monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        lineNumbers: 'on',
        readOnly,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        autoIndent: 'full',
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
        suggest: {
          insertMode: 'replace',
        },
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true,
        },
        // Enable error squiggles and gutter markers
        renderValidationDecorations: 'on',
        // Show error messages on hover
        hover: {
          enabled: true,
        },
        // Enable problems panel integration
        lightbulb: {
          enabled: true,
        },
      })

      // Handle content changes
      monacoRef.current.onDidChangeModelContent(() => {
        const value = monacoRef.current?.getValue() || ''
        onChange?.(value)
      })

      // Add keyboard shortcuts
      monacoRef.current.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          handleExecute()
        }
      )

      return () => {
        monacoRef.current?.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (monacoRef.current && value !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(value)
    }
  }, [value])

  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setModelLanguage(monacoRef.current.getModel()!, language)
    }
  }, [language])

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({ fontSize })
    }
  }, [fontSize])

  const handleExecute = async () => {
    if (!monacoRef.current || isExecuting || hasSyntaxErrors) return
    
    setIsExecuting(true)
    const code = monacoRef.current.getValue()
    
    try {
      await onExecute?.(code)
    } catch (error) {
      console.error('Code execution error:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  // Check if there are any syntax errors (not warnings)
  const hasSyntaxErrors = syntaxErrors.some(error => 
    error.severity === monaco.MarkerSeverity.Error
  )

  // Check if run button should be disabled
  const isRunDisabled = isExecuting || hasSyntaxErrors || readOnly

  const handleSave = () => {
    const code = monacoRef.current?.getValue() || ''
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${language === 'javascript' ? 'js' : language}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (monacoRef.current) {
      const resetValue = boilerplateCode || ''
      monacoRef.current.setValue(resetValue)
      onChange?.(resetValue)
    }
  }

  const formatDocument = async () => {
    if (monacoRef.current) {
      try {
        // Try Monaco's built-in formatter first
        const action = monacoRef.current.getAction('editor.action.formatDocument')
        if (action) {
          await action.run()
        } else {
          // Fallback to manual formatting
          manualFormat()
        }
      } catch (error) {
        console.warn('Monaco formatting failed, using manual format:', error)
        manualFormat()
      }
    }
  }

  const manualFormat = () => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel()
      if (model) {
        const code = model.getValue()
        let formattedCode = code
        
        // Basic JavaScript/TypeScript formatting
        if (language === 'javascript' || language === 'typescript') {
          formattedCode = code
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .replace(/\{/g, ' {\n  ')
            .replace(/\}/g, '\n}')
            .replace(/;/g, ';\n')
            .replace(/,/g, ',\n  ')
            .replace(/\n\s*\n/g, '\n')
            .split('\n')
            .map((line, index, arr) => {
              if (line.includes('}')) return line.replace(/^\s+/, '')
              if (arr[index - 1] && arr[index - 1].includes('{')) return '  ' + line.trim()
              return line.trim()
            })
            .join('\n')
        } else if (language === 'python') {
          // Basic Python formatting
          formattedCode = code
            .split('\n')
            .map(line => line.trimRight())
            .join('\n')
            .replace(/:/g, ':\n    ')
            .replace(/\n\s*\n/g, '\n')
        }
        
        if (formattedCode !== code && formattedCode.trim()) {
          model.setValue(formattedCode)
          onChange?.(formattedCode)
        }
      }
    }
  }

  return (
    <div className={`code-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          {showLanguageSelector && (
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value
                monaco.editor.setModelLanguage(monacoRef.current?.getModel()!, newLang)
                onLanguageChange?.(newLang)
              }}
              className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          )}
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {monacoRef.current?.getModel()?.getLineCount() || 0} lines
          </span>
          
          {/* Show syntax error indicator */}
          {hasSyntaxErrors && (
            <span className="text-xs text-red-600 dark:text-red-400 font-semibold px-2 py-1 bg-red-50 dark:bg-red-900/30 rounded flex items-center gap-1">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {syntaxErrors.filter(e => e.severity === monaco.MarkerSeverity.Error).length} error{syntaxErrors.filter(e => e.severity === monaco.MarkerSeverity.Error).length !== 1 ? 's' : ''}
            </span>
          )}
          
          {/* Show language indicator when language selector is disabled */}
          {!showLanguageSelector && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">
              {language === 'javascript' ? 'JavaScript' : 
               language === 'python' ? 'Python' : 
               language === 'java' ? 'Java' : 
               language === 'cpp' ? 'C++' : 
               language === 'go' ? 'Go' :
               language.charAt(0).toUpperCase() + language.slice(1)}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!readOnly && (
            <>
              <button
                onClick={formatDocument}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded text-xs font-medium transition-colors"
                title="Format code (Alt+Shift+F)"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16"/>
                  <path d="M4 12h16"/>
                  <path d="M4 17h16"/>
                </svg>
                Format
              </button>
              
              <button
                onClick={handleExecute}
                disabled={isRunDisabled}
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                  isRunDisabled
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                title={hasSyntaxErrors ? 'Fix syntax errors before running' : 'Run code (Ctrl+Enter)'}
              >
                <Play className="h-3 w-3" />
                {isExecuting ? 'Running...' : hasSyntaxErrors ? 'Fix Errors' : 'Run'}
              </button>
            </>
          )}
          
          <button
            onClick={handleSave}
            className="btn btn-outline p-1"
            title="Download code"
          >
            <Download className="h-3 w-3" />
          </button>
          
          {!readOnly && (
            <button
              onClick={handleReset}
              className="btn btn-outline p-1 text-red-600 hover:bg-red-50"
              title="Reset to boilerplate code"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-outline p-1"
            title="Editor settings"
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Font Size:
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="ml-2 w-20"
              />
              <span className="ml-1">{fontSize}px</span>
            </label>
          </div>
        </div>
      )}

      {/* Syntax Errors Display */}
      {syntaxErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Syntax Errors ({syntaxErrors.length})
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc space-y-1 pl-5">
                  {syntaxErrors.slice(0, 5).map((error, index) => (
                    <li key={index}>
                      <span className="font-mono text-xs bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded">
                        Line {error.startLineNumber}
                      </span>
                      : {error.message}
                    </li>
                  ))}
                  {syntaxErrors.length > 5 && (
                    <li className="text-red-600 dark:text-red-400">
                      ... and {syntaxErrors.length - 5} more errors
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        className="h-96 bg-gray-900"
        style={{ minHeight: '400px' }}
      />

      {/* Keyboard Shortcuts Help */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Shortcuts: </span>
        <span className="font-mono">Ctrl+Enter</span> Run • 
        <span className="font-mono"> Alt+Shift+F</span> Format • 
        <span className="font-mono"> Ctrl+/</span> Comment • 
        <span className="font-mono"> Ctrl+Z</span> Undo
      </div>
    </div>
  )
}