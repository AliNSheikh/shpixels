import { Plus, Save, Trash2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { ImageUploadDropzone } from '../common/ImageUploadDropzone';
import type { ClientLogo } from '../../types/content';

const fieldClass =
  'w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:border-[#2563eb] focus:outline-none';

function newBrand(order: number): ClientLogo {
  return {
    id: `brand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: 'New Brand',
    logoUrl: '',
    websiteUrl: '',
    order,
    visible: true
  };
}

export function BrandLogoManager() {
  const { content, updateClientLogos } = useContent();
  const logos = [...(content.clientLogos || [])].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );

  const updateLogo = (id: string, updates: Partial<ClientLogo>) => {
    updateClientLogos(
      (content.clientLogos || []).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const addLogo = () => {
    updateClientLogos([
      ...(content.clientLogos || []),
      newBrand((content.clientLogos || []).length + 1)
    ]);
  };

  const deleteLogo = (id: string) => {
    updateClientLogos((content.clientLogos || []).filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b2b2b]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#f1f2ed] font-quicksand uppercase">
            Brand Logo Marquee
          </h2>
          <p className="mt-1 text-xs text-[#a8a6a1]">
            Upload logos of brands you have worked with. Visible logos automatically replace the old text marquee on the homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={addLogo}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#3b82f6] text-xs font-semibold text-white"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {logos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2b2b2b] bg-[#171717] p-10 text-center">
          <p className="text-sm font-semibold text-[#f1f2ed]">No brand logos yet</p>
          <p className="mt-1 text-xs text-[#706e6a]">
            Add a brand, upload its logo from your device, and it will appear in the scrolling marquee.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logos.map((brand, index) => {
            const logoValue = brand.logoUrl || brand.logo || '';
            const websiteValue = brand.websiteUrl || brand.website || '';

            return (
              <article
                key={brand.id}
                className="rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] p-4 sm:p-5"
              >
                <div className="grid lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-4">
                    <ImageUploadDropzone
                      label="Brand Logo"
                      value={logoValue}
                      onChange={(url) => updateLogo(brand.id, { logoUrl: url, logo: url })}
                      previewFit="contain"
                      compact
                      aspectRatio="aspect-[3/1]"
                      helperText="Uploaded files are stored in Supabase Storage."
                    />
                  </div>

                  <div className="lg:col-span-8 grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#706e6a] mb-1">
                        Brand Name
                      </label>
                      <input
                        value={brand.name}
                        onChange={(e) => updateLogo(brand.id, { name: e.target.value })}
                        placeholder="Brand name"
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#706e6a] mb-1">
                        Website / Landing Page
                      </label>
                      <input
                        value={websiteValue}
                        onChange={(e) => updateLogo(brand.id, { websiteUrl: e.target.value, website: e.target.value })}
                        placeholder="https://..."
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#706e6a] mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={brand.order ?? index + 1}
                        onChange={(e) => updateLogo(brand.id, { order: Number(e.target.value) || index + 1 })}
                        className={fieldClass}
                      />
                    </div>

                    <div className="flex items-end gap-3">
                      <label className="flex-1 min-h-[38px] px-3 rounded-xl bg-[#232323] border border-[#2b2b2b] flex items-center gap-2 text-xs text-[#a8a6a1]">
                        <input
                          type="checkbox"
                          checked={brand.visible !== false}
                          onChange={(e) => updateLogo(brand.id, { visible: e.target.checked })}
                        />
                        Show in marquee
                      </label>

                      <button
                        type="button"
                        onClick={() => deleteLogo(brand.id)}
                        className="min-h-[38px] px-3 rounded-xl border border-red-900/50 bg-red-950/20 text-red-400 hover:text-red-300"
                        title="Delete brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="rounded-xl bg-[#171717] border border-[#2b2b2b] p-3 flex items-start gap-2 text-xs text-[#706e6a]">
        <Save className="w-4 h-4 text-[#38bdf8] mt-0.5 shrink-0" />
        <p>
          Brand changes use the same CMS auto-save/publish pipeline as the rest of the site. Logos are uploaded to Supabase Storage and the brand records are projected into the <code className="text-[#a8a6a1]">client_logos</code> database table.
        </p>
      </div>
    </div>
  );
}
