import React, { useState, useRef, useEffect } from 'react';
import { Category, Observation } from '../types';
import { Sprout, Bug, CloudSun, Palette, Trash2, Save, RotateCcw, PenTool, Mic, MicOff, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';

interface WriteFormProps {
  onSave: (obs: Omit<Observation, 'id'>) => void;
  onCancel: () => void;
}

export default function WriteForm({ onSave, onCancel }: WriteFormProps) {
  const [category, setCategory] = useState<Category>('plant');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [weather, setWeather] = useState<string>('sunny');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // AI Generated Properties Cached during draft editing
  const [aiFeedback, setAiFeedback] = useState('');
  const [detectedObject, setDetectedObject] = useState('');
  const [funFact, setFunFact] = useState('');
  const [quiz, setQuiz] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Speech Recognition (STT) States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Drawing Canvas States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#2a4735');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // Palette colors for children
  const colors = [
    '#2a4735', // Dark Forest Green
    '#39a060', // Grass Green
    '#ec5e5e', // Strawberry Red
    '#fba235', // Orange
    '#ffd043', // Sunny Yellow
    '#4b9eff', // Sky Blue
    '#9e66ff', // Lavender Purple
    '#f59ebd', // Pastel Pink
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'ko-KR';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setDescription((prev) => prev + ' ' + finalTranscript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error('STT Error:', e);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('이 브라우저에서는 음성 입력을 지원하지 않아요. 😢 크롬을 사용하면 더 잘 동작해요!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution & background white
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fill background with white so the saved image is not transparent
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Drawing Logic
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Scale coordinates based on canvas internal width/height
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.touches[0].clientY - rect.top) / rect.height) * canvas.height,
      };
    } else {
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Brush style setup
    ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
    ctx.lineWidth = brushSize;
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Run Multimodal AI analysis for handdrawing and description (OCR simulation)
  const handleAnalyzeDrawing = async () => {
    if (!description.trim()) {
      alert('그림을 더 잘 이해할 수 있도록 짧은 한 줄 설명을 먼저 적어주세요! 😊');
      return;
    }

    setIsAnalyzing(true);

    const canvas = canvasRef.current;
    let drawingDataUrl: string | undefined = undefined;
    if (canvas) {
      drawingDataUrl = canvas.toDataURL('image/png');
    }

    try {
      const response = await fetch('/api/gemini/analyze-drawing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || '나의 자연 관찰',
          description,
          category,
          drawingDataUrl
        })
      });

      const data = await response.json();
      
      if (data.detectedObject) {
        setDetectedObject(data.detectedObject);
        // Add recognized creature as a hashtag if not exists
        if (!tags.includes(data.detectedObject)) {
          setTags((prev) => [...prev, data.detectedObject]);
        }
      }
      if (data.aiFeedback) setAiFeedback(data.aiFeedback);
      if (data.funFact) setFunFact(data.funFact);
      if (data.quiz) setQuiz(data.quiz);

      // Alert with cute feedback success toast simulation
      alert('AI 생물 박사님이 그림과 글 분석을 완료했어요! 아래의 예쁜 추천 칭찬과 상식을 확인해 보아요! ⭐');
    } catch (err) {
      console.error(err);
      alert('AI 박사님이 깊은 생각에 빠지셨어요. 글을 조금 더 다듬어 써 볼까요?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add Tag Logic
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/,/g, '');
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // Save Logic
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('관찰일지의 제목을 적어주세요! 😊');
      return;
    }
    if (!description.trim()) {
      alert('관찰 내용을 적어주세요! 😊');
      return;
    }

    // Get base64 image data from canvas
    const canvas = canvasRef.current;
    let drawingDataUrl: string | undefined = undefined;
    
    if (canvas) {
      drawingDataUrl = canvas.toDataURL('image/png');
    }

    const defaultEmojis: Record<Category, string> = {
      plant: '🌱',
      insect: '🦋',
      weather: '☀️',
      free: '🎨',
    };

    onSave({
      title,
      date,
      weather,
      category,
      description,
      drawingDataUrl,
      tags: tags.length > 0 ? tags : ['기록'],
      emoji: defaultEmojis[category],
      aiFeedback: aiFeedback || undefined,
      detectedObject: detectedObject || undefined,
      funFact: funFact || undefined,
      quiz: quiz || undefined
    });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 md:p-8 border-4 border-[#c2ebd1] bubbly-shadow mb-12"
      >
        <div className="flex items-center gap-3 mb-6 border-b border-dashed border-gray-100 pb-4">
          <div className="p-2.5 bg-[#eefaf1] rounded-2xl text-[#39a060] border-2 border-[#c2ebd1]">
            <PenTool size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2a4735]">새로운 관찰일지 만들기</h2>
            <p className="text-xs text-[#7da78c] font-medium mt-1">오늘 관찰한 새롭고 재미있는 일들을 기록해봐요!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-sm font-bold text-[#2a4735] mb-3">어떤 것을 관찰했나요? ✨</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'plant', label: '🌱 식물', color: 'border-[#a3e2bb] hover:bg-[#f0f9f4] text-[#2a6d45]' },
                { id: 'insect', label: '🦋 곤충', color: 'border-[#b8d4fc] hover:bg-[#f4f7fc] text-[#1d4ed8]' },
                { id: 'weather', label: '🌤️ 날씨', color: 'border-[#fbdcb8] hover:bg-[#fffbf4] text-[#b45309]' },
                { id: 'free', label: '🎨 자유', color: 'border-[#ebd6fc] hover:bg-[#faf5ff] text-[#6d28d9]' },
              ].map((item) => {
                const isActive = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as Category)}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm text-center transition-all cursor-pointer ${item.color} ${
                      isActive
                        ? 'bg-[#e8f5ed] border-[#39a060] bubbly-shadow-sm scale-[1.02]'
                        : 'bg-white border-gray-200'
                    }`}
                    style={{ minHeight: '52px' }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title, Date & Weather */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#2a4735] mb-2">일지 제목 ✍️</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 강낭콩 첫 싹이 돋았어요!"
                className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 outline-none focus:border-[#39a060] text-sm text-slate-800 font-bold"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2a4735] mb-2">관찰 날짜 📅</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 outline-none focus:border-[#39a060] text-sm text-slate-800 font-bold"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* Weather Selector */}
          <div>
            <label className="block text-sm font-bold text-[#2a4735] mb-2">오늘 날씨는 어땠나요? ☀️</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'sunny', label: '☀️ 맑음', activeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
                { id: 'cloudy', label: '☁️ 흐림', activeClass: 'bg-slate-100 text-slate-800 border-slate-300' },
                { id: 'rainy', label: '🌧️ 비옴', activeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
                { id: 'snowy', label: '❄️ 눈옴', activeClass: 'bg-sky-100 text-sky-800 border-sky-300' },
              ].map((item) => {
                const isActive = weather === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWeather(item.id)}
                    className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-xs transition-all cursor-pointer ${
                      isActive ? item.activeClass : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Drawing Canvas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-[#2a4735] flex items-center gap-2">
                직접 관찰한 그림 그리기 🎨
                <span className="text-[11px] text-gray-400 font-normal">(그림을 그리면 일지에 쏙 들어가요!)</span>
              </label>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEraser(!isEraser)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                    isEraser 
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ minHeight: '32px' }}
                >
                  <Palette size={13} />
                  {isEraser ? '연필 쓰기' : '지우개'}
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                  style={{ minHeight: '32px' }}
                >
                  <RotateCcw size={13} />
                  지우기
                </button>
              </div>
            </div>

            {/* Canvas Outer Border */}
            <div className="bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl p-4">
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                {/* Real HTML5 Canvas */}
                <div className="relative flex-1 aspect-[16/10] max-h-64 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={300}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                  />
                </div>

                {/* Canvas Controllers Side Panel */}
                <div className="flex md:flex-col justify-between md:justify-start gap-4 shrink-0 md:w-32">
                  {/* Colors Grid */}
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 mb-1.5">색깔 고르기</span>
                    <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setBrushColor(color);
                            setIsEraser(false);
                          }}
                          className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer relative ${
                            brushColor === color && !isEraser ? 'scale-110 border-slate-700 shadow-sm' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Brush Size Slider */}
                  <div className="flex-1 md:flex-none">
                    <span className="block text-[11px] font-bold text-gray-400 mb-1">연필 두께 ({brushSize})</span>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-[#39a060] cursor-pointer h-2 bg-gray-200 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Speech/AI buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-[#2a4735]">무엇을 발견하고 느꼈나요? 📝</label>
              <div className="flex gap-2">
                {/* Voice input button (STT) */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                      : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                  }`}
                  style={{ minHeight: '34px' }}
                >
                  {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                  <span>{isListening ? '말하는 중 (끄기)' : '마이크로 말하기'}</span>
                </button>

                {/* AI Drawing/Content analysis trigger */}
                <button
                  type="button"
                  onClick={handleAnalyzeDrawing}
                  disabled={isAnalyzing}
                  className="bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-gray-200 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 bubbly-shadow-sm transition-transform active:scale-95 cursor-pointer"
                  style={{ minHeight: '34px' }}
                >
                  {isAnalyzing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Sparkles size={13} className="text-yellow-300" />
                  )}
                  <span>{isAnalyzing ? '박사님 분석 중...' : 'AI 그림·글 분석'}</span>
                </button>
              </div>
            </div>

            {/* Listening Instruction notice */}
            {isListening && (
              <div className="mb-2 text-xs text-rose-500 font-extrabold flex items-center gap-1 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                선생님, 귀를 기울여 어린이의 목소리를 귀담아듣고 있어요! 천천히 이야기해 주세요.
              </div>
            )}

            {/* AI sprout loader visualizer */}
            {isAnalyzing && (
              <div className="mb-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                <Sprout size={36} className="text-emerald-500 animate-bounce" />
                <h4 className="text-xs font-bold text-emerald-800">
                  AI 생물 박사님이 돋보기로 일지와 관찰 그림을 해석하고 있어요! 🔍🌱
                </h4>
                <div className="w-48 bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full animate-pulse w-full" />
                </div>
              </div>
            )}

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="오늘 발견한 점을 자유롭게 적어주세요! (마이크 버튼을 눌러 말로 받아쓸 수도 있어요. 🎤)"
              rows={4}
              className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 outline-none focus:border-[#39a060] text-sm text-slate-800 leading-relaxed font-semibold"
            />
          </div>

          {/* AI Feedback Preview box (If already analysed before submit) */}
          {aiFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-2"
            >
              <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Wand2 size={13} className="text-indigo-500" />
                AI 생물 박사님의 칭찬과 팁 미리 보기 ⭐
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-bold">
                {aiFeedback}
              </p>
              {funFact && (
                <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl font-bold">
                  💡 <strong>박사님의 토막 상식:</strong> {funFact}
                </div>
              )}
            </motion.div>
          )}

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-bold text-[#2a4735] mb-2">검색용 태그 (선택) 🏷️</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-[#eefaf1] border border-[#a3e2bb] text-[#2a6d45] font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="text-gray-400 hover:text-red-500 font-bold leading-none cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="태그를 쓰고 쉼표(,)나 엔터를 누르면 추가돼요"
              className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 outline-none focus:border-[#39a060] text-sm text-slate-800"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dashed border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-2xl text-sm font-bold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              취소하기
            </button>
            <button
              type="submit"
              className="bg-[#39a060] hover:bg-[#2e834e] text-white font-bold px-8 py-3 rounded-2xl text-sm flex items-center gap-2 bubbly-shadow transition-all duration-300 scale-100 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              <Save size={18} />
              <span>작성 완료!</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
