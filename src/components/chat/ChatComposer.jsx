// /components/chat/ChatComposer.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { FilePreviews } from "./FilePreviews";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_FILES_PER_MESSAGE } from "../../lib/chatUtils";

export const ChatComposer = ({
  onSubmit,
  sending,
  canReply,
  dropRef,
  fileInputRef,
  isDragging,
  files,
  fileErrors,
  removeFile,
  handleIncomingFiles,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sending || (!text.trim() && files.length === 0)) return;
    onSubmit({ text: text.trim() });
    setText("");
    // La limpieza de archivos se maneja en el componente padre
  };
  
  // Pegar desde portapapeles
  useEffect(() => {
    const area = textareaRef.current;
    if (!area) return;
    const onPaste = (e) => {
      if (e.clipboardData?.files?.length) {
        handleIncomingFiles(e.clipboardData.files);
      }
    };
    area.addEventListener("paste", onPaste);
    return () => area.removeEventListener("paste", onPaste);
  }, [handleIncomingFiles]);

  if (!canReply) {
    return (
      <div className="text-center text-sm text-muted-foreground p-4 border-t border-border">
        El ticket está cerrado. No se pueden enviar más mensajes.
      </div>
    );
  }

  return (
    <div
      ref={dropRef}
      className={`border-t border-border p-3 transition-all ${
        isDragging ? "ring-2 ring-primary/30 rounded-b-2xl" : ""
      }`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <FilePreviews files={files} onRemove={removeFile} disabled={sending} />

        {fileErrors.length > 0 && (
          <div className="text-xs text-red-600 dark:text-red-400">
            {fileErrors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="relative">
            <button
              type="button"
              className="h-11 w-11 grid place-items-center rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/10 flex-shrink-0"
              title="Adjuntar archivos"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </button>
            {files.length > 0 && (
              <span className="absolute -top-1 -right-1 text-[11px] px-1.5 py-0.5 rounded-full bg-foreground text-background">
                {files.length}/{MAX_FILES_PER_MESSAGE}
              </span>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            disabled={sending}
          />

          <button
            type="submit"
            disabled={sending || (!text.trim() && files.length === 0)}
            className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-background font-medium hover:opacity-90 transition disabled:opacity-60 flex-shrink-0"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/70 border-t-transparent" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={ALLOWED_MIME_TYPES.join(",")}
          onChange={(e) => {
            handleIncomingFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="text-[11px] text-muted-foreground px-1">
          Máx {MAX_FILE_SIZE_MB} MB y {MAX_FILES_PER_MESSAGE} archivos.
        </div>
      </form>
    </div>
  );
};
