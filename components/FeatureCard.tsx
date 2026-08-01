import Link from "next/link";

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
};

export default function FeatureCard({
  title,
  description,
  href,
}: FeatureCardProps) {
  return (
    <Link href={href}>
      <div className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-3 text-gray-600">
          {description}
        </p>

        <div className="mt-6 text-blue-600 font-semibold">
          Open →
        </div>
      </div>
    </Link>
  );
}