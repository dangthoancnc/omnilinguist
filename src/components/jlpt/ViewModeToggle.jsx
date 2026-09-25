import React from 'react';
import { LayoutGrid, List, FolderTree, Network } from 'lucide-react';

/**
 * ViewModeToggle — 4 View Modes for Lesson Catalog:
 * - grid: Card Grid
 * - list: Compact List Table
 * - tree: Chapter Tree
 * - mindmap: Interactive Level Mindmap
 */
export default function ViewModeToggle({ mode, onChange }) {
  const modes = [
    { id: 'grid', label: 'Lưới', icon: <LayoutGrid size={14} />, title: 'Chế độ thẻ bài (Grid)' },
    { id: 'list', label: 'Danh sách', icon: <List size={14} />, title: 'Chế độ danh sách gọn (List)' },
    { id: 'tree', label: 'Cây', icon: <FolderTree size={14} />, title: 'Chế độ phân cấp chương mục (Tree)' },
    { id: 'mindmap', label: 'Sơ đồ', icon: <Network size={14} />, title: 'Chế độ sơ đồ tư duy tương tác (Mindmap)' },
  ];

  return (
    <div className="jlpt-view-toggle" role="group" aria-label="Chế độ hiển thị">
      {modes.map(m => (
        <button
          key={m.id}
          type="button"
          className={`jlpt-view-toggle-btn ${mode === m.id ? 'jlpt-view-toggle-btn--active' : ''}`}
          onClick={() => onChange(m.id)}
          title={m.title}
        >
          {m.icon}
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
