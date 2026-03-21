import Link from 'next/link';
import { BookOpen, Users } from 'lucide-react';
import Badge from './Badge';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price: number;
  instructor?: string;
  enrollmentCount?: number;
  published?: boolean;
  progress?: number;
  showProgress?: boolean;
}

export default function CourseCard({
  id,
  title,
  description,
  thumbnail,
  price,
  instructor,
  enrollmentCount,
  published = true,
  progress,
  showProgress = false,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${id}`}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md border border-gray-100"
    >
      <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600">
        {!thumbnail && (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-white opacity-50" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant={published ? 'success' : 'warning'}>
            {published ? 'Published' : 'Draft'}
          </Badge>
        </div>
        {showProgress && progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-green-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-white">{progress}% complete</p>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">
            {price > 0 ? `₹${price}` : 'Free'}
          </span>
          {instructor && (
            <span className="text-sm text-gray-500">{instructor}</span>
          )}
        </div>
        {enrollmentCount !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            <span>{enrollmentCount} students</span>
          </div>
        )}
      </div>
    </Link>
  );
}
