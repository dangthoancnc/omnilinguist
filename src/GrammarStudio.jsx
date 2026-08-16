// v9.1.50-5 — Writing & Output Studio (Đa cấp độ, liên kết Từ vựng)
import React, { useState, useEffect, useMemo } from 'react';
import writingData from './data/writingPrompts.json';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db.js';
import { analyzeEmail } from './keigoChecker.js';
import { Send, FileText, CheckCircle, AlertTriangle, Info, MessageSquare, Copy, BrainCircuit } from 'lucide-react';

const LEVEL_COLORS = { N5:'#10b981', N4:'#3b82f6', N3:'#f59e0b', N2:'#8b5cf6', N1:'#ef4444' };

const WritingStudio = () => {
  const vocabData = useLiveQuery(() => db.vocab.toArray()) || [];
  const [selectedId, setSelectedId] = useState(writingData[0].id);
  const [inputText, setInputText] = useState('');
  const [issues, setIssues] = useState([]);
  const [viewMode, setViewMode] = useState('write'); // 'write' | 'template'
  const [targetVocab, setTargetVocab] = useState([]);
  
  const template = writingData.find(e => e.id === selectedId);

  // Lấy ngẫu nhiên 5 từ vựng cùng Level khi chọn bài viết mới
  useEffect(() => {
    if (template) {
      const levelWords = vocabData.filter(v => v.level === template.level);
      const shuffled = [...levelWords].sort(() => 0.5 - Math.random());
      setTargetVocab(shuffled.slice(0, 5));
    }
  }, [template?.id, vocabData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Analyze text (Keigo & structure)
      let currentIssues = analyzeEmail(inputText);
      
      // Filter out Keigo issues if it's N5/N4 (since they don't need strict Keigo yet)
      if (template?.level === 'N5' || template?.level === 'N4') {
        currentIssues = currentIssues.filter(i => i.type !== 'keigo' && i.type !== 'structure');
      }

      // Analyze Vocab usage
      if (inputText.trim()) {
        const unused = targetVocab.filter(v => !inputText.includes(v.word));
        if (unused.length === 0) {
          currentIssues.unshift({
            type: 'success',
            message: 'Hoàn thành Từ vựng!',
            suggestion: 'Tuyệt vời! Bạn đã sử dụng thành công toàn bộ các từ vựng mục tiêu.'
          });
        } else if (unused.length < targetVocab.length) {
          currentIssues.push({
            type: 'vocab',
            message: 'Chưa dùng hết từ vựng gợi ý',
            suggestion: `Bạn còn thiếu: ${unused.map(v => v.word).join(', ')}`
          });
        }
      }

      setIssues(currentIssues);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputText, template, targetVocab]);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.sample);
    alert('Đã copy bài viết mẫu!');
  };

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', height: 'calc(100vh - 100px)' }}>
      {/* LEFT: Template List */}
      <div className="glass-panel" style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: 16, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} color="var(--accent-primary)"/> Chủ đề Viết (Output)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => {
            const items = writingData.filter(d => d.level === lvl);
            if (items.length === 0) return null;
            return (
              <div key={lvl}>
                <div style={{ fontSize: '0.8rem', color: LEVEL_COLORS[lvl], fontWeight: 800, marginBottom: 8, borderBottom: `1px solid ${LEVEL_COLORS[lvl]}33`, paddingBottom: 4 }}>
                  Cấp độ {lvl}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map(e => (
                    <div key={e.id} onClick={() => { setSelectedId(e.id); setInputText(''); setViewMode('write'); }}
                      style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${selectedId === e.id ? LEVEL_COLORS[lvl] : 'rgba(255,255,255,0.05)'}`, background: selectedId === e.id ? `${LEVEL_COLORS[lvl]}15` : 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: selectedId === e.id ? 700 : 400, color: selectedId === e.id ? 'white' : 'var(--text-secondary)' }}>
                        {e.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Editor & Feedback */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Scenario Header */}
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 4, background: `${LEVEL_COLORS[template.level]}22`, color: LEVEL_COLORS[template.level], fontWeight: 800, marginRight: 10 }}>
                {template.level}
              </span>
              <strong style={{ fontSize: '1.2rem' }}>{template.title}</strong>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setViewMode('write')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === 'write' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.85rem' }}>
                ✏️ Viết bài
              </button>
              <button onClick={() => setViewMode('template')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === 'template' ? '#10b981' : 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.85rem' }}>
                📄 Xem bài mẫu
              </button>
            </div>
          </div>
          <div style={{ fontSize: '0.95rem', color: 'white', background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 8, borderLeft: `3px solid ${LEVEL_COLORS[template.level]}`, lineHeight: 1.5 }}>
            {template.scenario}
          </div>
        </div>

        {/* Editor or Template View */}
        {viewMode === 'write' ? (
          <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
            {/* Editor */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={14}/> Soạn thảo
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inputText.length} ký tự</span>
              </div>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Hãy viết bài của bạn vào đây...\n\nGợi ý dàn ý:\n${template.structure}`}
                className="jp-text"
                style={{ flex: 1, width: '100%', padding: 20, background: 'transparent', border: 'none', color: 'white', fontSize: '1.05rem', lineHeight: 1.7, resize: 'none', outline: 'none' }}
              />
            </div>

            {/* AI Feedback & Vocab Objectives */}
            <div className="glass-panel" style={{ width: 340, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              
              {/* Vocab Objective Box */}
              <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.85rem', color: '#60a5fa', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BrainCircuit size={16}/> Từ vựng gợi ý (Cố gắng dùng)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {targetVocab.map((v, i) => {
                    const isUsed = inputText.includes(v.word);
                    return (
                      <span key={i} title={v.vi} style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: 6, background: isUsed ? '#10b981' : 'rgba(0,0,0,0.3)', color: isUsed ? 'white' : 'var(--text-secondary)', textDecoration: isUsed ? 'line-through' : 'none', border: `1px solid ${isUsed ? '#10b981' : 'var(--glass-border)'}`, transition: 'all 0.2s' }}>
                        {v.word}
                      </span>
                    );
                  })}
                </div>
              </div>

              <h3 style={{ fontSize: '0.9rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} color="#10b981"/> Cố vấn Viết lách (AI)
              </h3>
              
              {!inputText.trim() ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '0.85rem' }}>
                  <Info size={30} style={{ opacity: 0.3, marginBottom: 10 }}/>
                  <p>Bắt đầu gõ để nhận phản hồi về từ vựng và văn phong.</p>
                </div>
              ) : issues.length === 0 ? (
                <div style={{ padding: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', fontSize: '0.88rem' }}>
                  <strong>Tuyệt vời!</strong> Bài viết có cấu trúc tốt và không phát hiện lỗi cơ bản.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {issues.map((iss, i) => (
                    <div key={i} style={{ padding: 12, borderRadius: 8, border: `1px solid ${iss.type === 'keigo' ? 'rgba(239,68,68,0.3)' : iss.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.3)'}`, background: iss.type === 'keigo' ? 'rgba(239,68,68,0.08)' : iss.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: iss.type === 'keigo' ? '#fca5a5' : iss.type === 'success' ? '#10b981' : '#fcd34d', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                        {iss.type === 'success' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} {iss.message}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'white', lineHeight: 1.5 }}>
                        {iss.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Template View */
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem' }}>Mẫu tham khảo</h3>
              <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <Copy size={14}/> Copy
              </button>
            </div>
            <pre className="jp-text" style={{ background: 'rgba(0,0,0,0.3)', padding: 24, borderRadius: 10, whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: 1.8, color: '#e2e8f0', fontFamily: 'inherit', border: '1px solid var(--glass-border)' }}>
              {template.sample}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingStudio;
