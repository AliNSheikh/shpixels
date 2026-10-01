import { useMemo, useState } from 'react';
import { Check, Edit3, ExternalLink, Plus, Trash2, Video } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import type { YouTubeVideoItem } from '../../types/content';
import { extractYouTubeId, getYouTubeThumbnailUrl } from '../../utils/youtube';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { ConfirmModal } from '../common/ConfirmModal';

function makeVideo(category: string, order: number): YouTubeVideoItem {
  return {
    id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: '',
    youtubeUrl: '',
    videoId: '',
    thumbnail: '',
    description: '',
    category,
    featured: false,
    order,
    visible: true,
    caption: '',
    client: ''
  };
}

export function VideoManager() {
  const { content, categories, updateContent, addVideo, updateVideo, deleteVideo } = useContent();

  const availableCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []).map((item) => String(item || '').trim()).filter(Boolean),
    [categories]
  );

  const defaultCategory = availableCategories[0] || 'Uncategorized';

  // Hero / showreel remains a separate global video.
  const [heroVideoInput, setHeroVideoInput] = useState(content.hero.featuredVideoId || '');
  const [heroVideoSaved, setHeroVideoSaved] = useState(false);

  // Category-video editor state.
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideoItem | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<YouTubeVideoItem | null>(null);
  const [formState, setFormState] = useState<YouTubeVideoItem>(
    makeVideo(defaultCategory, (content.featuredVideos?.length || 0) + 1)
  );

  const categoryVideos = useMemo(
    () => [...(content.featuredVideos || [])]
      .filter(Boolean)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [content.featuredVideos]
  );

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
    setFormState(makeVideo(defaultCategory, (content.featuredVideos?.length || 0) + 1));
    setIsAdding(true);
  };

  const handleOpenEdit = (video: YouTubeVideoItem) => {
    setEditingVideo(video);
    setFormState({ ...video });
    setIsAdding(true);
  };

  const handleUrlChange = (url: string) => {
    const videoId = extractYouTubeId(url);
    setFormState((current) => ({
      ...current,
      youtubeUrl: url,
      videoId,
      thumbnail: videoId ? getYouTubeThumbnailUrl(videoId) : ''
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const category = String(formState.category || '').trim();
    const videoId = extractYouTubeId(formState.youtubeUrl || formState.videoId);

    if (!category || !videoId) return;

    const existingCount = (content.featuredVideos || []).filter((video) => video.category === category).length;
    const normalized: YouTubeVideoItem = {
      ...formState,
      category,
      videoId,
      youtubeUrl: formState.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: formState.thumbnail || getYouTubeThumbnailUrl(videoId),
      title: String(formState.title || '').trim() || `${category} Video ${existingCount + 1}`,
      visible: formState.visible !== false
    };

    if (editingVideo) {
      updateVideo(normalized);
    } else {
      addVideo(normalized);
    }

    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-[#2b2b2b]">
        <h2 className="text-xl sm:text-2xl font-black text-[#f1f2ed] font-quicksand uppercase">
          Category YouTube Videos
        </h2>
        <p className="text-xs text-[#a8a6a1]">
          Paste a YouTube link, choose a category, and save. The video appears directly inside that category page—no project record is required.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#232323]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              Primary Website Showreel
            </h3>
          </div>
          <span className="text-xs font-mono text-[#706e6a]">
            Active ID: {content.hero.featuredVideoId || 'None'}
          </span>
        </div>

        <form onSubmit={handleSaveHeroVideo} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={heroVideoInput}
              onChange={(e) => setHeroVideoInput(e.target.value)}
              placeholder="Paste the main YouTube Showreel URL or Video ID"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:outline-none focus:border-[#2563eb]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
            >
              {heroVideoSaved ? <Check className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              <span>{heroVideoSaved ? 'Showreel Saved!' : 'Update Showreel'}</span>
            </button>
          </div>
        </form>

        <div className="max-w-2xl pt-2">
          <YouTubeEmbed
            videoId={content.hero.featuredVideoId}
            title="Hero Showreel Preview"
            lazyLoad={false}
          />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#232323]">
          <div>
            <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
              Videos Inside Categories ({categoryVideos.length})
            </h3>
            <p className="text-xs text-[#a8a6a1]">
              The selected category controls exactly where each video is displayed on the public site.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold uppercase tracking-wider text-white transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add YouTube Video</span>
          </button>
        </div>

        {availableCategories.length === 0 && (
          <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-4 text-xs text-amber-300">
            Create at least one category in Category Manager before adding videos.
          </div>
        )}

        {categoryVideos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2b2b2b] p-8 text-center text-xs text-[#706e6a]">
            No category videos have been added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryVideos.map((video) => (
              <article
                key={video.id}
                className="rounded-xl bg-[#232323] border border-[#2b2b2b] overflow-hidden p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-[#38bdf8] font-bold">
                        {video.category || 'Uncategorized'}
                      </span>
                      <h4 className="text-sm font-bold text-[#f1f2ed] line-clamp-1">
                        {video.title || 'YouTube Video'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(video)}
                        className="p-1.5 rounded-lg text-[#a8a6a1] hover:text-white hover:bg-[#1d1d1d]"
                        title="Edit Video"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setVideoToDelete(video)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-[#1d1d1d]"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <YouTubeEmbed videoId={video.videoId || video.youtubeUrl} title={video.title || 'YouTube Video'} lazyLoad />

                  {video.description && (
                    <p className="text-xs text-[#a8a6a1] line-clamp-2">{video.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#1d1d1d] flex items-center justify-between text-[11px] font-mono text-[#706e6a]">
                  <span>{video.visible === false ? 'Hidden' : 'Visible in category'}</span>
                  <a
                    href={`https://youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[#f1f2ed]"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#171717] border border-[#2b2b2b] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2b2b]">
              <div>
                <h3 className="text-base font-bold text-[#f1f2ed] uppercase font-quicksand">
                  {editingVideo ? 'Edit Category Video' : 'Add Category Video'}
                </h3>
                <p className="mt-1 text-[11px] text-[#706e6a]">YouTube link + category are the only required fields.</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-1.5 rounded-lg text-[#a8a6a1] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1">YouTube URL *</label>
                <input
                  type="text"
                  required
                  value={formState.youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
                />
                {formState.videoId && (
                  <p className="text-[10px] font-mono text-emerald-400 mt-1">Detected: {formState.videoId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1">Category *</label>
                <select
                  required
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
                >
                  {availableCategories.length === 0 ? (
                    <option value="">Create a category first</option>
                  ) : (
                    availableCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="Leave blank to create an automatic title"
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#a8a6a1] mb-1">Description (optional)</label>
                <textarea
                  rows={2}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Short description"
                  className="w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#a8a6a1]">
                <input
                  type="checkbox"
                  checked={formState.visible !== false}
                  onChange={(e) => setFormState({ ...formState, visible: e.target.checked })}
                />
                Display this video on the category page
              </label>

              {formState.videoId && (
                <YouTubeEmbed videoId={formState.videoId} title={formState.title || 'Preview'} lazyLoad={false} />
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2b2b2b]">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-lg bg-[#232323] text-xs text-[#a8a6a1] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableCategories.length === 0 || !formState.videoId}
                  className="px-5 py-2 rounded-lg bg-[#2563eb] hover:bg-[#3b82f6] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold uppercase text-white"
                >
                  Save Video to Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(videoToDelete)}
        title="Delete Video"
        message={`Are you sure you want to remove "${videoToDelete?.title || 'this video'}" from its category?`}
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
