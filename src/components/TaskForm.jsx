// file: src/components/TaskForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getTaskDetailsFromTranscript } from '../utils/gemini';

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1rem', height: '1rem' }}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const Loader = () => <div className="loader" />;

const TaskForm = ({ onSubmit, taskToEdit, onCancelEdit }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('normal');
  const [due, setDue] = useState('');
  const inputRef = useRef(null);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const isEditing = !!taskToEdit;
  const isSpeechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  useEffect(() => {
    if (taskToEdit) {
      setText(taskToEdit.text);
      setPriority(taskToEdit.priority);
      setDue(taskToEdit.due || '');
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      resetForm();
    }
  }, [taskToEdit]);
  
  const resetForm = () => {
      setText('');
      setPriority('normal');
      setDue('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length === 0 || text.trim().length > 500) return;

    if (isEditing) {
      const updatedTask = {
        text: text.trim(),
        priority,
        due: due || null,
        completed: taskToEdit.completed,
      };
      onSubmit(updatedTask);
    } else {
      const newTask = {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const handleVoiceSubmit = async (transcript) => {
    setIsProcessing(true);
    try {
      const taskDetails = await getTaskDetailsFromTranscript(transcript);
      if (taskDetails) {
        setText(taskDetails.text || '');
        setPriority(taskDetails.priority || 'normal');
        setDue(taskDetails.due || '');

        if(taskDetails.reminder) {
          alert(`AI understood a reminder request for "${taskDetails.reminder}", but this feature is not yet available.`);
        }
        
        inputRef.current?.focus();
      } else {
        // If AI can't structure it, just use the raw transcript.
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
      setText('');
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

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-row">
        <label htmlFor="task-text" className="sr-only">Task description</label>
        <input
          id="task-text"
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isRecording ? "Listening..." : (isEditing ? "Edit your task..." : "What needs to be done?")}
          className="input"
          required
          minLength={1}
          maxLength={500}
          disabled={isRecording || isProcessing}
        />
        {isSpeechSupported && (
          <button
            type="button"
            onClick={toggleRecording}
            className={`btn btn-voice ${isRecording ? 'recording' : ''}`}
            disabled={isEditing || isProcessing}
            aria-label={isRecording ? 'Stop recording' : 'Record task by voice'}
          >
            {isProcessing ? <Loader/> : <MicIcon />}
          </button>
        )}
        <button
          type="submit"
          className="btn primary"
          disabled={!text.trim() || isRecording || isProcessing}
          aria-label={isEditing ? 'Save changes' : 'Add task'}
        >
          {isEditing ? 'Save' : 'Add'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn secondary"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="form-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="task-priority" style={{ fontSize: '0.875rem', fontWeight: 500 }} className="muted">Priority:</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="select"
            disabled={isRecording || isProcessing}
          >
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="task-due" style={{ fontSize: '0.875rem', fontWeight: 500 }} className="muted">Due Date:</label>
          <input
            id="task-due"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="date"
            disabled={isRecording || isProcessing}
          />
        </div>
      </div>
    </form>
  );
};

export default TaskForm;