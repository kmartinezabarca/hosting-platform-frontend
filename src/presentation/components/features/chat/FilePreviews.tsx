// /components/chat/FilePreviews.jsx
import React from "react";
import { X, Paperclip } from "lucide-react";
import { isImageMime, fmtBytes } from "../../lib/chatUtils";

export const FilePreviews = ({ files, onRemove, disabled }) => {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-5 gap-2">
      {files.map(({ file, previewUrl }, idx) =>
        isImageMime(file.type) ? (
          <div key={idx} className="relative">
            <img
              src={previewUrl}
              alt={file.name}
              className="w-20 h-20 rounded-lg object-cover"
              title={file.name}
            />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-black/70 text-white hover:opacity-90"
              aria-label="Quitar"
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            key={idx}
            className="relative flex flex-col justify-center col-span-2 p-2 rounded-lg ring-1 ring-black/10 dark:ring-white/10 bg-black/5 dark:bg-white/10"
            title={file.name}
          >
            <div className="flex items-start gap-2">
                <Paperclip className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                    <div className="text-xs truncate">{file.name}</div>
                    <div className="text-[10px] opacity-70">{fmtBytes(file.size)}</div>
                </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Quitar"
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      )}
    </div>
  );
};
