import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority, NewTask, EditableTask } from '../types';
import { getTaskDetailsFromTranscript, analyzeImageWithSuggestions, performImageAction, Suggestion, ImageAction, ActionResult } from '../utils/gemini';

// FIX: Add types for the Web Speech API to resolve TypeScript errors.
// These types are not included in the default TypeScript DOM library.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  item(index: number): SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface TaskFormProps {
  onSubmit: (taskData: NewTask | EditableTask) => void;
  taskToEdit: Task | null;
  onCancelEdit: () => void;
}

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const Loader = () => (
    <div className="w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin" />
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
);


const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, taskToEdit, onCancelEdit }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [due, setDue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Image analysis state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // For initial suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isPerformingAction, setIsPerformingAction] = useState(false); // For follow-up actions
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!taskToEdit;
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (taskToEdit) {
      setText(taskToEdit.text);
      setPriority(taskToEdit.priority);
      setDue(taskToEdit.due || '');
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      // Reset form when not editing
      resetForm();
    }
  }, [taskToEdit]);
  
  const resetImageState = () => {
    setImagePreview(null);
    setImageFile(null);
    setIsAnalyzing(false);
    setSuggestions([]);
    setIsPerformingAction(false);
    setActionResult(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const resetForm = () => {
      setText('');
      setPriority('normal');
      setDue('');
      resetImageState();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length === 0 || text.trim().length > 500) return;
    
    if (isEditing) {
        const updatedTask: EditableTask = {
            text: text.trim(),
            priority,
            due: due || null,
            completed: taskToEdit.completed,
        };
        onSubmit(updatedTask);
    } else {
        const newTask: NewTask = {
            text: text.trim(),
            priority,
            due: due || null,
        };
        onSubmit(newTask);
    }
    
    if (!isEditing) {
      resetForm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isEditing) {
        onCancelEdit();
      } else {
        resetForm();
      }
    }
  };
  
  const handleVoiceSubmit = async (transcript: string) => {
    setIsProcessing(true);
    try {
      const taskDetails = await getTaskDetailsFromTranscript(transcript);
      if (taskDetails) {
        setText(taskDetails.text || '');
        setPriority(taskDetails.priority || 'normal');
        setDue(taskDetails.due || '');
        inputRef.current?.focus();
      } else {
        setText(transcript);
      }
    } catch (error) {
      console.error('Error processing transcript with Gemini:', error);
      alert('There was an issue understanding your request. Please try again.');
      setText(transcript); // Fallback to raw transcript
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setText(''); // Clear text when starting to record
    };
    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleVoiceSubmit(transcript);
      }
    };

    recognitionRef.current.start();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetImageState();
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setIsAnalyzing(true);
      try {
        const result = await analyzeImageWithSuggestions(file);
        setSuggestions(result || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSuggestionClick = async (action: ImageAction) => {
    if (!imageFile) return;

    setIsPerformingAction(true);
    setActionResult(null);
    try {
        const result = await performImageAction(imageFile, action);
        setActionResult(result);
    } catch (error) {
        console.error(error);
        setActionResult({ type: 'text', data: 'An unexpected error occurred.' });
    } finally {
        setIsPerformingAction(false);
    }
  };
  
  const useActionResult = () => {
    if (!actionResult || actionResult.type !== 'text') return;
    setText(prev => prev ? `${prev}\n\n${actionResult.data}` : actionResult.data);
    setActionResult(null);
    inputRef.current?.focus();
  };

  const isBusy = isRecording || isProcessing || isAnalyzing || isPerformingAction;

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <label htmlFor="task-text" className="sr-only">Task description</label>
        <input
          id="task-text"
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isRecording ? "Listening..." : (isEditing ? "Edit your task..." : "What needs to be done?")}
          className="flex-grow w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          minLength={1}
          maxLength={500}
          disabled={isBusy}
        />
         {isSpeechSupported && (
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex-shrink-0 p-2 w-10 h-10 flex items-center justify-center rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
              isRecording
                ? 'bg-red-500 text-white border-red-500 animate-pulse'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            disabled={isEditing || isBusy}
            aria-label={isRecording ? 'Stop recording' : 'Record task by voice'}
          >
            {isProcessing ? <Loader /> : <MicIcon />}
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!text.trim() || isBusy}
          aria-label={isEditing ? 'Save changes' : 'Add task'}
        >
          {isEditing ? 'Save' : 'Add'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div>
          <label htmlFor="task-priority" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Priority:</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            disabled={isBusy}
          >
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="task-due" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Due Date:</label>
          <input
            id="task-due"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            disabled={isBusy}
          />
          <label htmlFor="image-upload" className="cursor-pointer p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Upload an image for analysis">
            <ImageIcon />
          </label>
          <input
            id="image-upload"
            type="file"
            ref={fileInputRef}
            className="sr-only"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            disabled={isBusy}
          />
        </div>
      </div>
       {(imagePreview || isAnalyzing) && (
        <div className="mt-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-start gap-4">
            {imagePreview && (
                <div className="relative flex-shrink-0">
                    <img src={imagePreview} alt="Image preview" className="w-24 h-24 object-cover rounded-md" />
                    <button 
                        type="button" 
                        onClick={resetImageState} 
                        className="absolute -top-2 -right-2 bg-gray-700 hover:bg-black text-white rounded-full p-0.5 disabled:opacity-50"
                        aria-label="Remove image"
                        disabled={isBusy}
                    >
                        <XIcon />
                    </button>
                </div>
            )}
            <div className="flex-grow min-w-0">
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  <span>Analyzing image...</span>
                </div>
              )}

              {!isAnalyzing && suggestions.length > 0 && !actionResult && !isPerformingAction && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">AI Suggestions</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map((suggestion) => (
                      <button 
                        key={suggestion.action} 
                        type="button" 
                        onClick={() => handleSuggestionClick(suggestion.action)}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isPerformingAction && (
                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  <span>Working on it...</span>
                </div>
              )}

              {actionResult && !isPerformingAction && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">AI Result</h4>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-3 rounded-md">
                    {actionResult.type === 'text' ? (
                      actionResult.data.split('\n').map((line, index) => (
                        <p key={index} className="my-1">{line}</p>
                      ))
                    ) : (
                      <img src={`data:image/png;base64,${actionResult.data}`} alt="Enhanced result" className="rounded-md max-w-full" />
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {actionResult.type === 'text' && (
                        <button type="button" onClick={useActionResult} className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Use this text</button>
                    )}
                    <button type="button" onClick={() => setActionResult(null)} className="px-3 py-1 text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Back to suggestions</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default TaskForm;