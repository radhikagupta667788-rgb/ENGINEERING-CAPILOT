type Props = {
  title: string;
  value: string;
  icon: string;
};


export default function StatsCard({
  title,
  value,
  icon,
}: Props) {

  return (
    <div className="theme-card group rounded-3xl p-6 hover:-translate-y-1">

      <div className="flex items-center justify-between">

        <div>

          <p className="theme-muted text-sm">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {value}
          </h2>

        </div>


        <div className="rounded-2xl bg-blue-500/20 p-4 text-3xl group-hover:scale-110">
          {icon}
        </div>

      </div>

    </div>
  );
}