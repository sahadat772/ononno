'use client'

const actions = [
  { title: 'New Version', icon: '📚' },
  { title: 'Add Class', icon: '🏫' },
  { title: 'Add Subject', icon: '📖' },
  { title: 'Add Chapter', icon: '📑' },
  { title: 'Add Lesson', icon: '🎯' },
  { title: 'AI Lesson', icon: '🤖' },
  { title: 'Import', icon: '📥' },
  { title: 'Export', icon: '📤' },
]

export default function QuickActions() {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {actions.map((action) => (
          <button
            key={action.title}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
          >
            <div className="text-3xl">
              {action.icon}
            </div>

            <p className="mt-3 text-sm font-medium">
              {action.title}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}