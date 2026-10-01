import { useMemo, useState } from 'react';
import { Video, Plus, Trash2, Edit3, Check, ExternalLink } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import type { YouTubeVideoItem } from '../../types/content';
import { extractYouTubeId, getYouTubeThumbnailUrl } from '../../utils/youtube';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { ConfirmModal } from '../common/ConfirmModal';

export function VideoManager() {
  const { content, categories, updateContent, addVideo, updateVideo, deleteVideo } = useContent();

  const availableCategories = useMemo(
    () => (Array.isArray(categories) ? categories.filter(Boolean) : []),
    [categories]
  );

  const defaultCategory = availableCategories[0] || 'Uncategorized';

  const [heroVideoInput, setHeroVideoInput] = useState(content.hero.featuredVideoId || '');
  const [heroVideoSaved, setHeroVideoSaved] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideoItem | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<YouTubeVideoItem | null>(null);

  const emptyVideo = (): YouTubeVideoItem => ({
    id: `video-${Date.now()}`,
    title: '',
    youtubeUrl: '',
    videoId: '',
    thumbnail: '',
    description: '',
    category: defaultCategory,
    featured: false,
    order: (content.featuredVideos?.length || 0) + 1,
    visible: true,
    caption: '',
    client: ''
  });

  const [formState, setFormState] = useState<YouTubeVideoItem>(emptyVideo());

  const handleSaveHeroVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractYouTubeId(heroVideoInput);
    if (!cleanId) return;

    updateContent({
      hero: {
        ...content.hero,
        featuredVideoId: cleanId
      }
    });
    setHeroVideoSaved(true);
    setTimeout(() => setHeroVideoSaved(false), 2500);
  };

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormState(emptyVideo());
    setIsAdding(true);
  };

  const handleOpenEdit = (video: YouTubeVideoItem) => {
    setEditingVideo(video);
    setFormState(video);
    setIsAdding(true);
  };

  const handleUrlChange = (url: string) => {
    const videoId = extractYouTubeId(url);
    setFormState((current) => ({
      ...current,
      youtubeUrl: url,
      videoId,
      thumbnail: getYouTubeThumbnailUrl(videoId)
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.videoId || !formState.category) return;

    const normalized: YouTubeVideoItem = {
      ...formState,
      title: formState.title.trim() || `${formState.category} Video`,
      thumbnail: formState.thumbnail || getYouTubeThumbnailUrl(formState.videoId),
      visible: true
    };

    if (editingVideo) updateVideo(normalized);
    else addVideo(normalized);

    setIsAdding(false);
  };

  const videos = [...(content.featuredVideos || [])]
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-[#2b2b2b]">
        <h2 className="text-xl sm:text-2xl font-black text-[#f1f2ed] font-quicksand uppercase">
          Category YouTube Videos
        </h2>
        <p className="text-xs text-[#a8a6a1]">
          Paste a YouTube link, choose its category, and the video appears directly inside that category on the public website.
        </p>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#f1f2ed] uppercase font-quicksand">Main Showreel</h3>
            <p className="mt-1 text-xs text-[#706e6a]">This controls the Hero / Showreel video only.</p>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-[#706e6a]">ID: {content.hero.featuredVideoId || 'None'}</span>
        </div>
        <form onSubmit={handleSaveHeroVideo} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={heroVideoInput}
            onChange={(e) => setHeroVideoInput(e.target.value)}
            placeholder="Paste YouTube URL or video ID"
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:outline-none focus:border-[#2563eb]"
          />
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold text-white inline-flex items-center justify-center gap-2">
            {heroVideoSaved ? <Check className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            {heroVideoSaved ? 'Saved' : 'Update Showreel'}
          </button>
        </form>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232323]">
          <div>
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              Videos by Category ({videos.length})
            </h3>
            <p className="text-xs text-[#a8a6a1]">No project record is required.</p>
          </div>
          <button onClick={handleOpenAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold text-white self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Add YouTube Video
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-[#2b2b2b] text-center text-xs text-[#706e6a]">
            No category videos yet. Add a YouTube link and choose a category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {videos.map((video) => (
              <article key={video.id} className="rounded-xl bg-[#232323] border border-[#2b2b2b] overflow-hidden p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#38bdf8] font-bold">{video.category || 'Uncategorized'}</span>
                    <h4 className="mt-1 text-sm font-bold text-[#f1f2ed]">{video.title || 'YouTube Video'}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(video)} className="p-1.5 rounded-lg text-[#a8a6a1] hover:text-white hover:bg-[#1d1d1d]" title="Edit video">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setVideoToDelete(video)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-[#1d1d1d]" title="Delete video">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <YouTubeEmbed videoId={video.videoId || video.youtubeUrl} title={video.title || 'YouTube Video'} lazyLoad />

                <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-[#706e6a]">
                  <span className="truncate">YouTube ID: {video.videoId}</span>
                  <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#f1f2ed] whitespace-nowrap">
                    YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#171717] border border-[#2b2b2b] p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2b2b]">
              <div>
                <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
                  {editingVideo ? 'Edit Category Video' : 'Add Category Video'}
                </h3>
                <p className="mt-1 text-[11px] text-[#706e6a]">Only the YouTube link and category are required.</p>
              </div>
              <button type="button" onClick={() => setIsAdding(false)} className="p-1.5 rounded-lg text-[#a8a6a1] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1">YouTube URL *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formState.youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
                />
                {formState.videoId && <p className="mt-1 text-[10px] font-mono text-emerald-400">Detected: {formState.videoId}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1">Category *</label>
                <select
                  required
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
                >
                  {availableCategories.length === 0 && <option value="Uncategorized">Uncategorized</option>}
                  {availableCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>

              <details className="rounded-xl bg-[#1d1d1d] border border-[#2b2b2b] p-3">
                <summary className="cursor-pointer text-xs font-semibold text-[#a8a6a1]">Optional details</summary>
                <div className="space-y-3 mt-3">
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="Optional video title"
                    className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed]"
                  />
                  <input
                    type="text"
                    value={formState.client || ''}
                    onChange={(e) => setFormState({ ...formState, client: e.target.value })}
                    placeholder="Optional client name"
                    className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed]"
                  />
                  <textarea
                    rows={2}
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Optional description"
                    className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] resize-none"
                  />
                </div>
              </details>

              {formState.videoId && (
                <YouTubeEmbed videoId={formState.videoId} title={formState.title || 'YouTube Video Preview'} lazyLoad={false} />
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2b2b2b]">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg bg-[#232323] text-xs text-[#a8a6a1] hover:text-white">Cancel</button>
                <button type="submit" disabled={!formState.videoId || !formState.category} className="px-5 py-2 rounded-lg bg-[#2563eb] hover:bg-[#3b82f6] disabled:opacity-40 text-xs font-semibold uppercase text-white">
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(videoToDelete)}
        title="Delete Video"
        message={`Are you sure you want to remove "${videoToDelete?.title || 'this video'}"?`}
        confirmLabel="Delete Video"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (videoToDelete) {
            deleteVideo(videoToDelete.id);
            setVideoToDelete(null);
          }
        }}
        onCancel={() => setVideoToDelete(null)}
      />
    </div>
  );
}
