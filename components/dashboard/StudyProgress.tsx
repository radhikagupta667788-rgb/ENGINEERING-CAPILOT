const progressItems = [
  { name: "DSA", value: 65 },
  { name: "SQL", value: 80 },
  { name: "Aptitude", value: 45 },
];

export default function StudyProgress() {
  return (
    <section className="theme-card rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        📈 Study Progress
      </h2>

      <div className="mt-6 space-y-5">
        {progressItems.map((item) => (
          <div key={item.name}>
            <div className="mb-2 flex justify-between">
              <span className="font-medium">{item.name}</span>
              <span className="theme-muted">{item.value}%</span>
            </div>

            <div className="h-3 rounded-full bg-gray-300">
              <div
                className="h-3 rounded-full bg-blue-600"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}