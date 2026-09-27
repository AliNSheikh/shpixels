import { Cpu } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export function Skills() {
  const { content } = useContent();
  const skills = (content.skills || [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (skills.length === 0) return null;
  const header = content.sectionHeaders?.skills;

  return (
    <section id="skills" className="py-16 sm:py-24 bg-[#171717] border-t border-[#2b2b2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--site-accent)]">
            {header?.badge || 'SKILLS & TOOLCHAIN'}
          </p>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black text-[#f1f2ed] font-quicksand uppercase">
            {header?.title || 'Capabilities'}
          </h2>
          {header?.description && <p className="mt-3 max-w-2xl text-sm text-[#a8a6a1]">{header.description}</p>}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className="rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#232323] text-[var(--site-accent)] flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f1f2ed]">{skill.name}</h3>
                    <p className="text-xs text-[#706e6a]">{skill.category}</p>
                  </div>
                </div>
                {typeof skill.proficiency === 'number' && (
                  <span className="text-xs font-mono text-[#38bdf8]">{skill.proficiency}%</span>
                )}
              </div>
              {typeof skill.proficiency === 'number' && (
                <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-[#232323]">
                  <div className="h-full bg-[var(--site-accent)]" style={{ width: `${Math.max(0, Math.min(100, skill.proficiency))}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
