const activities = [
  {
    title: "Asked AI Mentor",
    description: "What is Binary Search?",
    time: "Just now",
  },
  {
    title: "Reviewed Code",
    description: "Checked Java array program",
    time: "2 hours ago",
  },
  {
    title: "Updated Resume",
    description: "Improved skills section",
    time: "Yesterday",
  },
];

export default function RecentActivity() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">🕒 Recent Activity</h2>

      <div className="mt-5 space-y-4">
        {activities.map((activity) => (
          <div
            key={`${activity.title}-${activity.time}`}
            className="rounded-xl border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {activity.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {activity.description}
                </p>
              </div>

              <span className="whitespace-nowrap text-xs text-gray-400">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}